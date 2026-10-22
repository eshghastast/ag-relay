import { getAccessToken, getProjectId, fetchModels, CURATED_MODELS } from "../lib/core.js";

export const config = { maxDuration: 60 };

function groupOf(id) {
  if (id.startsWith("claude") || id.startsWith("gpt-oss")) return "Claude + GPT";
  if (id.startsWith("gemini")) return "Gemini";
  return "Other";
}

export default async function handler(req, res) {
  const pass = process.env.DASH_PASSWORD || process.env.RELAY_API_KEY || "";
  const given = req.headers["x-dash-password"] || "";
  if (pass && given !== pass) { res.status(401).json({ error: { message: "wrong dashboard password" } }); return; }
  try {
    const token = await getAccessToken();
    const project = await getProjectId(token);
    const models = await fetchModels(token, project);
    const groups = {};
    for (const [id, m] of Object.entries(models || {})) {
      if (!CURATED_MODELS.includes(id)) continue;
      const g = groupOf(id);
      const q = m.quotaInfo || {};
      const entry = { id, displayName: m.displayName || id, fraction: typeof q.remainingFraction === "number" ? q.remainingFraction : null, resetTime: q.resetTime || null };
      if (!groups[g]) groups[g] = { name: g, fraction: null, resetTime: null, models: [] };
      groups[g].models.push(entry);
      if (entry.fraction !== null) groups[g].fraction = groups[g].fraction === null ? entry.fraction : Math.min(groups[g].fraction, entry.fraction);
      if (entry.resetTime && !groups[g].resetTime) groups[g].resetTime = entry.resetTime;
    }
    res.status(200).json({ ok: true, at: new Date().toISOString(), groups: ["Gemini", "Claude + GPT", "Other"].filter((g) => groups[g]).map((g) => groups[g]) });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e).slice(0, 200), groups: [] });
  }
}
