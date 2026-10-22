// Best-effort usage counters stored as one JSON blob (stats.json) in Vercel Blob.
// Every function here swallows its own errors: stats must NEVER break a relay call.
const PATHNAME = "stats.json";

function emptyStats() {
  return { totals: { requests: 0, errors: 0, prompt: 0, completion: 0 }, days: {}, recent: [] };
}

async function blobLib() {
  try { return await import("@vercel/blob"); } catch { return null; }
}

export async function readStats() {
  const lib = await blobLib();
  if (!lib || !process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const res = await lib.get(PATHNAME, { access: "private" });
    if (!res || !res.stream) return emptyStats();
    const text = await new Response(res.stream).text();
    const j = JSON.parse(text);
    return { ...emptyStats(), ...j, totals: { ...emptyStats().totals, ...(j.totals || {}) }, days: j.days || {}, recent: j.recent || [] };
  } catch (e) { console.log(JSON.stringify({ tag: "ag-relay-stats-error", where: "read", error: String(e && e.message || e).slice(0, 300) })); return emptyStats(); }
}

export async function recordUsage({ model, status, ms, usage }) {
  const lib = await blobLib();
  if (!lib || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    const s = (await readStats()) || emptyStats();
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const prompt = usage?.prompt_tokens || 0;
    const completion = usage?.completion_tokens || 0;
    s.totals.requests += 1;
    if (status >= 400) s.totals.errors += 1;
    s.totals.prompt += prompt;
    s.totals.completion += completion;
    const d = s.days[day] || (s.days[day] = { requests: 0, errors: 0, prompt: 0, completion: 0, byModel: {} });
    d.requests += 1;
    if (status >= 400) d.errors += 1;
    d.prompt += prompt;
    d.completion += completion;
    const m = d.byModel[model] || (d.byModel[model] = { requests: 0, prompt: 0, completion: 0 });
    m.requests += 1; m.prompt += prompt; m.completion += completion;
    s.recent.unshift({ at: now.toISOString(), model, status, ms, total: prompt + completion });
    s.recent = s.recent.slice(0, 30);
    // prune days older than 14
    const cutoff = new Date(now.getTime() - 14 * 864e5).toISOString().slice(0, 10);
    for (const k of Object.keys(s.days)) if (k < cutoff) delete s.days[k];
    await lib.put(PATHNAME, JSON.stringify(s), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
  } catch (e) { console.log(JSON.stringify({ tag: "ag-relay-stats-error", where: "record", error: String(e && e.message || e).slice(0, 300) })); }
}

// Schedule the write so it survives the response: Vercel's waitUntil keeps the
// invocation alive after the response is sent. Falls back to a bounded await
// outside Vercel. Never throws.
export async function recordUsageSoon(event) {
  const p = recordUsage(event);
  try {
    const vf = await import("@vercel/functions");
    if (typeof vf.waitUntil === "function") { vf.waitUntil(p); return; }
  } catch { /* not on Vercel — fall through */ }
  await Promise.race([p, new Promise((r) => setTimeout(r, 2500))]).catch(() => {});
}
