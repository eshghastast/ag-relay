import { readStats } from "../lib/stats.js";
import { checkRelayKey } from "../lib/core.js";

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (!checkRelayKey(req)) { res.status(401).json({ error: { message: "Invalid API key" } }); return; }
  const s = await readStats();
  if (!s) { res.status(200).json({ available: false, note: "stats store not reachable" }); return; }
  res.status(200).json({ available: true, ...s });
}
