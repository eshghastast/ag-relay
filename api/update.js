// One-click updater: syncs the deployment's OWN connected repo to upstream
// master, so the host's git integration deploys the new version.
//
// Why this exists: a Vercel/Netlify/Workers project only auto-deploys on
// pushes to ITS OWN connected repo. A Deploy Button clone is a snapshot,
// not linked to upstream, so upstream commits never reach it on their own —
// and a host "Redeploy" just redeploys the same commit, it never fetches
// upstream code. This endpoint is the bridge: it pushes upstream master
// into the deployer's repo via the GitHub API, and the push is what the
// host auto-deploys. A project with no git connection still gets its repo
// updated, but its owner must deploy from it (or connect git first).
//
// Setup (once, by the deployer, in the host's environment variables):
//   GH_SYNC_REPO  = "owner/repo" of THIS deployment's connected repo
//                   (e.g. the clone the Deploy Button created)
//   GH_SYNC_TOKEN = GitHub personal access token with `repo` scope
//                   (classic PAT), or a fine-grained token with Contents
//                   read+write on that one repo.
// The token is never returned, logged, or sent anywhere except api.github.com.
//
// How the push works (GitHub git-database API, no git binary needed):
//   1. Read upstream master's full file tree (recursive).
//   2. Read the target repo's default branch, HEAD commit, and tree.
//   3. Upload only blobs whose content changed (same path + same sha =
//      identical content, git is content-addressed, so re-upload is skipped).
//   4. Build the new tree from scratch — so files deleted upstream are
//      deleted in the target too — then commit on top of the target HEAD
//      and fast-forward the branch ref.
// Atomicity: nothing lands in the target repo until the final ref update,
// so a failed run (network error, timeout, bad token) pushes nothing —
// orphaned blobs/trees are just garbage GitHub never references.
// Excluded: `.github/` (a future upstream workflow must never silently
// start running Actions in someone else's repo), and the target repo is
// never allowed to be upstream itself.
// Limits: repos with more than MAX_FILES files are refused (this repo is
// ~30 files); very large updates on Cloudflare Workers may hit the free
// plan's per-request subrequest cap — typical small updates stay far under
// it, and a failed run is safe to retry.
//
// Auth: dashboard password only (same rule as status-data, timing-safe).
// Anyone who can unlock the dashboard can trigger a sync of their own
// repo — that is the point — but nobody else can.
import { checkDashPassword } from "../lib/core.js";

const UPSTREAM_REPO = "eshghastast/ag-relay";
const UPSTREAM_BRANCH = "master";
const MAX_FILES = 300;

async function gh(token, path, method, body) {
  const r = await fetch("https://api.github.com" + path, {
    method: method || "GET",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ag-relay-updater",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let j = null;
  try { j = await r.json(); } catch (e) { /* non-JSON error body */ }
  if (!r.ok) {
    const msg = (j && j.message) ? String(j.message) : ("GitHub HTTP " + r.status);
    const err = new Error(msg.slice(0, 200));
    err.status = r.status;
    throw err;
  }
  return j;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: { message: "Method not allowed" } }); return; }
  if (!checkDashPassword(req)) { res.status(401).json({ error: { message: "wrong dashboard password" } }); return; }

  const repo = (process.env.GH_SYNC_REPO || "").trim();
  const token = process.env.GH_SYNC_TOKEN || "";
  if (!repo || !token || !/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    res.status(400).json({ error: { code: "not_configured", message: "GH_SYNC_REPO (owner/repo) and GH_SYNC_TOKEN are not set in this deployment's environment variables." } });
    return;
  }
  if (repo.toLowerCase() === UPSTREAM_REPO) {
    res.status(400).json({ error: { code: "same_repo", message: "GH_SYNC_REPO must be your own deployment's repo, not upstream itself." } });
    return;
  }

  try {
    // 1. Upstream tree.
    const upstreamTree = await gh(token, "/repos/" + UPSTREAM_REPO + "/git/trees/" + UPSTREAM_BRANCH + "?recursive=1");
    if (upstreamTree.truncated) throw new Error("Upstream tree is truncated; refusing a partial sync.");
    const files = (upstreamTree.tree || []).filter((e) => e.type === "blob" && !e.path.startsWith(".github/"));
    if (files.length === 0 || files.length > MAX_FILES) throw new Error("Unexpected upstream file count (" + files.length + "); refusing to sync.");

    // 2. Target repo state.
    const target = await gh(token, "/repos/" + repo);
    const branch = target.default_branch || "master";
    const ref = await gh(token, "/repos/" + repo + "/git/ref/heads/" + encodeURIComponent(branch));
    const head = ref.object && ref.object.sha;
    if (!head) throw new Error("Could not read the target branch HEAD.");
    let have = new Map();
    try {
      const targetTree = await gh(token, "/repos/" + repo + "/git/trees/" + encodeURIComponent(branch) + "?recursive=1");
      for (const e of targetTree.tree || []) if (e.type === "blob") have.set(e.path, e.sha);
    } catch (e) { have = new Map(); } // unknown target tree: upload everything

    // 3. Upload changed blobs only.
    let changed = 0;
    const entries = [];
    for (const f of files) {
      if (have.get(f.path) === f.sha) {
        entries.push({ path: f.path, mode: f.mode, type: "blob", sha: f.sha });
        continue;
      }
      const blob = await gh(token, "/repos/" + UPSTREAM_REPO + "/git/blobs/" + f.sha);
      const created = await gh(token, "/repos/" + repo + "/git/blobs", "POST", { content: blob.content, encoding: "base64" });
      entries.push({ path: f.path, mode: f.mode, type: "blob", sha: created.sha });
      changed++;
    }

    // 4. Tree -> commit -> fast-forward ref.
    const newTree = await gh(token, "/repos/" + repo + "/git/trees", "POST", { tree: entries });
    const latest = await gh(token, "/repos/" + UPSTREAM_REPO + "/commits/" + UPSTREAM_BRANCH);
    const upstreamSha = (latest.sha || "").slice(0, 7);
    const commit = await gh(token, "/repos/" + repo + "/git/commits", "POST", {
      message: "[ag-relay] Sync from upstream " + UPSTREAM_REPO + "@" + upstreamSha + " via dashboard updater",
      tree: newTree.sha,
      parents: [head],
    });
    await gh(token, "/repos/" + repo + "/git/refs/heads/" + encodeURIComponent(branch), "PATCH", { sha: commit.sha });

    res.status(200).json({
      ok: true,
      repo,
      branch,
      from: head.slice(0, 7),
      to: commit.sha.slice(0, 7),
      upstream: upstreamSha,
      files: files.length,
      changed,
    });
  } catch (e) {
    res.status(502).json({ error: { message: String(e.message || e).slice(0, 300) } });
  }
}
