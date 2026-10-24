// Netlify entry point for POST /v1/chat/completions — thin wrapper over the
// shared Vercel handler (see netlify/lib/adapter.mjs). No relay logic here.
import vercelHandler from "../../api/chat.js";
import { toNetlify } from "../lib/adapter.mjs";

export const handler = toNetlify(vercelHandler);
