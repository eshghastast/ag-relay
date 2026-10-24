// Netlify entry point for GET /api/version — thin wrapper over the shared
// Vercel handler (see netlify/lib/adapter.mjs). No relay logic here.
import vercelHandler from "../../api/version.js";
import { toNetlify } from "../lib/adapter.mjs";

export const handler = toNetlify(vercelHandler);
