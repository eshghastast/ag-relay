// Netlify entry point for GET /api/status-data (dashboard quota data) —
// thin wrapper over the shared Vercel handler (see netlify/lib/adapter.mjs).
import vercelHandler from "../../api/status-data.js";
import { toNetlify } from "../lib/adapter.mjs";

export const handler = toNetlify(vercelHandler);
