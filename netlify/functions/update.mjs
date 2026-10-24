// Netlify entry point for POST /api/update — thin wrapper over the shared
// Vercel handler (see netlify/lib/adapter.mjs). No relay logic here.
import vercelHandler from "../../api/update.js";
import { toNetlify } from "../lib/adapter.mjs";

export const handler = toNetlify(vercelHandler);
