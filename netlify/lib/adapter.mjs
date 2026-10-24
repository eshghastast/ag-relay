// Netlify Functions adapter: run the Vercel-style handlers in api/ unchanged.
// Netlify calls (event, context) and expects { statusCode, headers, body };
// Vercel handlers expect (req, res) with req.method/headers/body and
// res.status().json() / res.writeHead() / res.write() / res.end() /
// res.setHeader() / res.send(). This shim translates between the two, so
// the relay logic lives in exactly one place (api/ + lib/core.js) and the
// Netlify port cannot drift from the Vercel one.
//
// One deliberate difference: streaming responses are buffered. The chat
// handler writes SSE chunks as they arrive; a Netlify function response is
// returned whole, so the shim collects every chunk and returns the complete
// SSE body at once. Clients still parse it as a normal SSE stream — they
// just don't see the first token until the generation finishes. Two
// consequences, both worth knowing before you deploy:
//   - Netlify's buffered-response cap (6 MB) applies to the whole reply, so
//     extremely long generations can hit it.
//   - If you need true token-by-token streaming, use the Docker/VPS path
//     (port 1) or Vercel instead.

function normalizeHeaders(headers = {}) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) out[k.toLowerCase()] = v;
  return out;
}

export function toNetlify(vercelHandler) {
  return async (event, _context) => {
    const headers = normalizeHeaders(event.headers);
    let body = event.body || "";
    if (event.isBase64Encoded && body) body = Buffer.from(body, "base64").toString("utf8");
    const req = { method: event.httpMethod, headers, body };

    let statusCode = 200;
    const outHeaders = {};
    const chunks = [];
    let headSent = false;
    let ended = false;

    const res = {
      get headersSent() { return headSent; },
      status(code) { statusCode = code; return res; },
      setHeader(name, value) { outHeaders[name] = value; },
      json(obj) {
        outHeaders["Content-Type"] = "application/json";
        chunks.push(JSON.stringify(obj));
        headSent = true;
        ended = true;
        return res;
      },
      send(data) {
        if (typeof data === "object" && data !== null && !Buffer.isBuffer(data)) {
          if (!outHeaders["Content-Type"]) outHeaders["Content-Type"] = "application/json";
          chunks.push(JSON.stringify(data));
        } else {
          chunks.push(String(data));
        }
        headSent = true;
        ended = true;
        return res;
      },
      writeHead(code, hdrs) {
        statusCode = code;
        Object.assign(outHeaders, hdrs || {});
        headSent = true;
      },
      write(chunk) {
        chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
        headSent = true;
      },
      end(chunk) {
        if (chunk !== undefined) res.write(chunk);
        ended = true;
      },
    };

    try {
      await vercelHandler(req, res);
    } catch (e) {
      // A handler that threw before sending anything gets a clean 502;
      // one that was mid-stream just ends with whatever it already wrote.
      if (!headSent) {
        statusCode = 502;
        outHeaders["Content-Type"] = "application/json";
        chunks.length = 0;
        chunks.push(JSON.stringify({ error: { message: String(e.message || e) } }));
      }
      ended = true;
    }

    if (!ended && !headSent) {
      // A handler that returned without sending anything — should not happen.
      statusCode = 500;
      outHeaders["Content-Type"] = "application/json";
      chunks.push(JSON.stringify({ error: { message: "Handler produced no response" } }));
    }

    return { statusCode, headers: outHeaders, body: chunks.join("") };
  };
}
