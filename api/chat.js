import { generateChat, toOpenAIResponse, sseToOpenAIChunk, checkRelayKey } from "../lib/core.js";
import { recordUsageSoon } from "../lib/stats.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: { message: "Method not allowed" } }); return; }
  if (!checkRelayKey(req)) { res.status(401).json({ error: { message: "Invalid API key" } }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== "object") { res.status(400).json({ error: { message: "Invalid JSON body" } }); return; }

  const stream = !!body.stream;
  const startedAt = Date.now();
  try {
    const { upstream, model } = await generateChat(body, { stream });
    if (!stream) {
      const j = await upstream.json();
      const out = toOpenAIResponse(j, model);
      console.log(JSON.stringify({ tag: "ag-relay-usage", at: new Date().toISOString(), model, stream: false, status: 200, ms: Date.now() - startedAt, usage: out.usage }));
      await recordUsageSoon({ model, status: 200, ms: Date.now() - startedAt, usage: out.usage });
      res.status(200).json(out);
      return;
    }
    // Streaming passthrough with format translation
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
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
        let payload;
        try { payload = JSON.parse(data); } catch { continue; }
        const chunk = sseToOpenAIChunk(payload, model);
        if (chunk) {
          chunk.id = chunkId;
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
      }
    }
    console.log(JSON.stringify({ tag: "ag-relay-usage", at: new Date().toISOString(), model, stream: true, status: 200, ms: Date.now() - startedAt }));
    await recordUsageSoon({ model, status: 200, ms: Date.now() - startedAt, usage: null });
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (e) {
    console.log(JSON.stringify({ tag: "ag-relay-usage", at: new Date().toISOString(), model: body.model || null, stream, status: 502, ms: Date.now() - startedAt, error: String(e.message || e).slice(0, 200) }));
    if (!res.headersSent) res.status(502).json({ error: { message: String(e.message || e) } });
    else { try { res.end(); } catch {} }
  }
}
