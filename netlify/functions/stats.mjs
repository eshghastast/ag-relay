// Netlify entry point for GET /api/stats — thin wrapper over the shared
// Vercel handler (see netlify/lib/adapter.mjs). Usage stats live in Vercel
// Blob, so on Netlify this answers available:false; the relay itself is
// unaffected.
import vercelHandler from "../../api/stats.js";
import { toNetlify } from "../lib/adapter.mjs";

export const handler = toNetlify(vercelHandler);
