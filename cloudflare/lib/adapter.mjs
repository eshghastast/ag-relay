// Cloudflare Workers adapter: run the Vercel-style handlers in api/ unchanged.
// A Worker returns a fetch() Response, while Vercel handlers expect (req, res)
// with req.method/headers/body and res.status().json() / res.writeHead() /
// res.write() / res.end() / res.setHeader() / res.send(). This shim translates
// between the two, so the relay logic lives in exactly one place (api/ +
// lib/core.js) and the Workers port cannot drift from the Vercel one.
//
// Unlike the Netlify adapter (which buffers the whole reply because a
// Netlify function returns one object), this one streams for real: handler
// output flows through a TransformStream, so chat SSE chunks reach the
// client token-by-token as the upstream generates them. The Response is
// returned as soon as the handler sends its head (writeHead / json / send);
// the handler keeps writing into the stream afterwards.
//
// Two mechanics worth knowing:
//   - Writes are serialized through a promise chain so a chunk can never
//     overtake an earlier one or land after the stream closes.
//   - Hop-by-hop headers (connection, keep-alive, transfer-encoding) are
//     dropped: the Workers runtime owns the connection, and the chat
//     handler's "Connection: keep-alive" must not leak into the Response.

const encoder = new TextEncoder();
const HOP_HEADERS = new Set(["connection", "keep-alive", "transfer-encoding"]);

function cleanHeaders(outHeaders) {
  const out = {};
  for (const [k, v] of Object.entries(outHeaders)) {
    if (HOP_HEADERS.has(k.toLowerCase())) continue;
    out[k] = v;
  }
  return out;
}

export function toWorker(vercelHandler) {
  return async (request) => {
    const url = new URL(request.url);
    const headers = {};
    request.headers.forEach((v, k) => { headers[k] = v; });
    if (!headers.host) headers.host = url.host;
    let body = "";
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.text();
    }
    const req = { method: request.method, headers, body };

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    let statusCode = 200;
    const outHeaders = {};
    let headSent = false;
    let ended = false;

    let headResolve;
    const headPromise = new Promise((r) => { headResolve = r; });
    const notifyHead = () => { if (!headSent) { headSent = true; headResolve(); } };

    let writeChain = Promise.resolve();
    const writeChunk = (s) => {
      if (ended) return writeChain;
      writeChain = writeChain.then(() => writer.write(encoder.encode(s))).catch(() => {});
      return writeChain;
    };

    const res = {
      get headersSent() { return headSent; },
      status(code) { statusCode = code; return res; },
      setHeader(name, value) { outHeaders[name] = value; },
      json(obj) {
        outHeaders["Content-Type"] = "application/json";
        writeChunk(JSON.stringify(obj));
        notifyHead();
        ended = true;
        return res;
      },
      send(data) {
        if (typeof data === "object" && data !== null) {
          if (!outHeaders["Content-Type"]) outHeaders["Content-Type"] = "application/json";
          writeChunk(JSON.stringify(data));
        } else {
          writeChunk(String(data));
        }
        notifyHead();
        ended = true;
        return res;
      },
      writeHead(code, hdrs) {
        statusCode = code;
        Object.assign(outHeaders, hdrs || {});
        notifyHead();
      },
      write(chunk) {
        writeChunk(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
        notifyHead();
      },
      end(chunk) {
        if (chunk !== undefined) res.write(chunk);
        ended = true;
      },
    };

    let handlerDoneResolve;
    const handlerDone = new Promise((r) => { handlerDoneResolve = r; });
    const run = (async () => {
      try {
        await vercelHandler(req, res);
      } catch (e) {
        // A handler that threw before sending anything gets a clean 502;
        // one that was mid-stream just ends with whatever it already wrote.
        if (!headSent) {
          statusCode = 502;
          outHeaders["Content-Type"] = "application/json";
          writeChunk(JSON.stringify({ error: { message: String(e.message || e) } }));
          notifyHead();
        }
      } finally {
        if (!headSent) {
          // A handler that returned without sending anything — should not happen.
          statusCode = 500;
          outHeaders["Content-Type"] = "application/json";
          writeChunk(JSON.stringify({ error: { message: "Handler produced no response" } }));
          notifyHead();
        }
        // Flush queued chunks before closing, or the last chunk can be lost.
        await writeChain;
        try { await writer.close(); } catch {}
        handlerDoneResolve();
      }
    })();

    // Wait for the head (or for the handler to finish, if it never sends
    // one), then hand the still-open stream back as the Response body.
    // The handler keeps running in the background, writing into the stream;
    // returning the Response does not cancel it — the stream keeps the
    // request alive until it closes.
    await Promise.race([headPromise, handlerDone]);
    // Do NOT await run here: it resolves only when the stream closes, and
    // awaiting it would buffer the whole reply. run never rejects (its
    // try/catch + finally swallow everything), so floating it is safe.
    run.catch(() => {});
    return new Response(stream.readable, { status: statusCode, headers: cleanHeaders(outHeaders) });
  };
}
