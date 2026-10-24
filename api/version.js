// Public version info: lets dashboard visitors see which repo commit this
// deployment runs, so they can tell whether an update is available.
// No auth, no secrets: the commit sha of a public repo is public.
// Vercel sets VERCEL_GIT_COMMIT_SHA automatically; other hosts (or local
// runs) report "dev" unless the deployer sets it.
export default async function handler(req, res) {
  if (req.method !== "GET") { res.status(405).json({ error: { message: "Method not allowed" } }); return; }
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || "";
  res.status(200).json({
    repo: "eshghastast/ag-relay",
    branch: "master",
    commit: sha ? sha.slice(0, 7) : "dev",
  });
}
