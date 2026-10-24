// Cloudflare Workers entry point (port 3): the same relay, on Workers.
// Each route is a thin wrapper over the shared handler in api/ (via
// cloudflare/lib/adapter.mjs), so there is no second copy of the relay
// logic to keep in sync. Routes mirror vercel.json, so clients use the
// same URLs on every host.
//
// Two Workers-specific pieces live here, and only here:
//
// 1. Env injection. Workers pass secrets as bindings (the `env` argument),
//    but lib/core.js reads process.env — including once at import time
//    (the AG_PROJECT_ID cache seed and the fail-closed warning). So the
//    bindings are copied into process.env BEFORE the handlers are loaded,
//    exactly like bin/ag-serve.mjs does for local runs. The handlers are
//    therefore loaded with dynamic import() on the first request (and
//    cached after that); a static import would run before env exists.
//    Each dynamic import uses a literal specifier so wrangler can bundle it.
//
// 2. nodejs_compat. lib/core.js imports node:crypto and uses Buffer, both
//    of which need the nodejs_compat flag in wrangler.toml. Nothing else
//    in the shared code needs Node: fetch, crypto.randomUUID, TextEncoder,
//    TransformStream and setTimeout are all Workers-native.
//
// Secrets are NEVER in this file: set them with `wrangler secret put`
// (AG_REFRESH_TOKEN, AG_CLIENT_ID, AG_CLIENT_SECRET, RELAY_API_KEY,
// DASH_PASSWORD). AG_PROJECT_ID stays unset — auto-resolved, per README.

import { toWorker } from "./lib/adapter.mjs";

function installEnv(env) {
  const vars = {};
  for (const [k, v] of Object.entries(env || {})) {
    if (typeof v === "string") vars[k] = v;
  }
  if (!globalThis.process) globalThis.process = {};
  globalThis.process.env = vars;
}

// Route table: pathname -> loader for the shared api/ handler.
// Method checks (e.g. chat's 405 for non-POST) stay inside the handlers.
const ROUTES = {
  "/v1/chat/completions": () => import("../api/chat.js"),
  "/chat/completions": () => import("../api/chat.js"),
  "/v1/models": () => import("../api/models.js"),
  "/models": () => import("../api/models.js"),
  "/api/stats": () => import("../api/stats.js"),
  "/api/status-data": () => import("../api/status-data.js"),
  "/api/version": () => import("../api/version.js"),
  "/": () => import("../api/status.js"),
};

const handlerCache = new Map();
async function loadHandler(pathname) {
  if (!handlerCache.has(pathname)) {
    handlerCache.set(
      pathname,
      ROUTES[pathname]().then((m) => toWorker(m.default)),
    );
  }
  return handlerCache.get(pathname);
}

export default {
  async fetch(request, env, _ctx) {
    installEnv(env);
    const pathname = new URL(request.url).pathname;
    const loader = ROUTES[pathname];
    if (!loader) {
      return new Response(JSON.stringify({ error: { message: "Not found" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const handler = await loadHandler(pathname);
    return handler(request);
  },
};
