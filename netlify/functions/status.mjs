// Netlify entry point for GET / (the dashboard page) — thin wrapper over
// the shared Vercel handler (see netlify/lib/adapter.mjs). No logic here.
import vercelHandler from "../../api/status.js";
import { toNetlify } from "../lib/adapter.mjs";

export const handler = toNetlify(vercelHandler);
