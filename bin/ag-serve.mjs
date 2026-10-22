#!/usr/bin/env node
// Local OpenAI-compatible server backed by your Antigravity quota.
// Reads ~/.ag-relay/config.json (created by `npm run login`). Port: PORT env or 8787.
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";

const cfgFile = join(homedir(), ".ag-relay", "config.json");
if (!existsSync(cfgFile)) { console.error("No config found — run `npm run login` first."); process.exit(1); }
const cfg = JSON.parse(readFileSync(cfgFile, "utf8"));
process.env.AG_REFRESH_TOKEN = cfg.refresh_token;
process.env.AG_CLIENT_ID = cfg.client_id;
process.env.AG_CLIENT_SECRET = cfg.client_secret;
if (cfg.project_id) process.env.AG_PROJECT_ID = cfg.project_id;
if (cfg.relay_api_key) process.env.RELAY_API_KEY = cfg.relay_api_key;

const core = await import("../lib/core.js");

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
  try {
    if (!core.checkRelayKey(req)) return send(401, { error: { message: "Invalid API key" } });
    if (req.method === "GET" && (req.url === "/v1/models" || req.url === "/models")) {
      const token = await core.getAccessToken();
      const project = await core.getProjectId(token);
      const models = await core.fetchModels(token, project);
      const ids = Object.keys(models || {});
      return send(200, { object: "list", data: ids.map((id) => ({ id, object: "model", created: 0, owned_by: "antigravity" })) });
    }
    if (req.method === "POST" && (req.url === "/v1/chat/completions" || req.url === "/chat/completions")) {
      const body = await readBody(req);
      const { upstream, model } = await core.generateChat(body, { stream: !!body.stream });
      if (!body.stream) return send(200, core.toOpenAIResponse(await upstream.json(), model));
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const chunkId = "chatcmpl-" + globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 24);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          let payload; try { payload = JSON.parse(data); } catch { continue; }
          const chunk = core.sseToOpenAIChunk(payload, model);
          if (chunk) { chunk.id = chunkId; res.write(`data: ${JSON.stringify(chunk)}\n\n`); }
        }
      }
      res.write("data: [DONE]\n\n");
      return res.end();
    }
    return send(404, { error: { message: "Not found" } });
  } catch (e) {
    if (!res.headersSent) return send(502, { error: { message: String(e.message || e) } });
    try { res.end(); } catch {}
  }
});

const port = Number(process.env.PORT || 8787);
server.listen(port, () => {
  console.log(`ag-relay listening on http://localhost:${port}/v1`);
  console.log("Point any OpenAI-compatible client at that base URL.");
});
