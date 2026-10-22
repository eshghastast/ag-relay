// Local end-to-end test of the relay core against the real Antigravity backend.
// Reads tokens from ./.tokens.json (never prints them): {refresh_token, client_id, client_secret, relay_api_key?}
import { readFileSync } from "node:fs";

const t = JSON.parse(readFileSync(new URL("./.tokens.json", import.meta.url), "utf8"));
process.env.AG_REFRESH_TOKEN = t.refresh_token;
process.env.AG_CLIENT_ID = t.client_id;
process.env.AG_CLIENT_SECRET = t.client_secret;
if (t.project_id) process.env.AG_PROJECT_ID = t.project_id;

const core = await import("./lib/core.js");

const token = await core.getAccessToken();
console.log("access token: OK (len", token.length + ")");

const project = await core.getProjectId(token);
console.log("project:", project);

const models = await core.fetchModels(token, project);
console.log("upstream models:", Object.keys(models).join(", "));

const { upstream, model } = await core.generateChat(
  { model: process.argv[2] || "gemini-3.8-flash-low", messages: [{ role: "user", content: "Reply with exactly one word: OK" }] },
  { stream: false }
);
const j = await upstream.json();
console.log("chat model:", model);
console.log("chat response:", JSON.stringify(core.toOpenAIResponse(j, model), null, 2).slice(0, 1200));
