import { getAccessToken, getProjectId, fetchModels, checkRelayKey, CURATED_MODELS } from "../lib/core.js";
import { recordUsageSoon } from "../lib/stats.js";

export const config = { maxDuration: 60 };

const FALLBACK = CURATED_MODELS;

export default async function handler(req, res) {
  if (!checkRelayKey(req)) { res.status(401).json({ error: { message: "Invalid API key" } }); return; }
  let ids = FALLBACK;
  try {
    const token = await getAccessToken();
    const project = await getProjectId(token);
    const models = await fetchModels(token, project);
    const keys = Object.keys(models || {});
    if (keys.length) {
      const curated = CURATED_MODELS.filter((id) => keys.includes(id));
      ids = curated.length ? curated : keys;
    }
  } catch { /* serve fallback list */ }
  console.log(JSON.stringify({ tag: "ag-relay-usage", at: new Date().toISOString(), model: "(models-list)", stream: false, status: 200, count: ids.length }));
  await recordUsageSoon({ model: "(models-list)", status: 200, ms: 0, usage: null });
  res.status(200).json({
    object: "list",
    data: ids.map((id) => ({ id, object: "model", created: 0, owned_by: "antigravity" })),
  });
}
