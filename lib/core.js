// Antigravity relay core: OpenAI-compatible surface -> Google Code Assist internal API
// (the same backend the official Antigravity clients use), authenticated with a
// Google OAuth refresh token belonging to the account owner.

const BASE = "https://daily-cloudcode-pa.googleapis.com";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const UA = "antigravity/ide/2.11.0 darwin/arm64";

// Curated allowlist, live-verified 2026-10-22: every id here returned a real
// completion through the generate path. Google's raw catalog also lists ids
// that 404 on this tier (3.1-pro, mimo, qwen, tab_*), retired ids answering
// with a canned "no longer available" message (gemini-3.5 family), and
// capacity-less ones (gemini-2.5-pro -> 503).
export const CURATED_MODELS = [
  "gemini-3.8-flash-high", "gemini-3.8-flash-medium", "gemini-3.8-flash-low",
  "gemini-3.1-flash-lite", "gemini-3-flash",
  "gemini-2.5-flash", "gemini-2.5-flash-lite",
  "claude-sonnet-4-6", "claude-opus-4-6-thinking", "gpt-oss-120b-medium",
];

let tokenCache = { token: null, exp: 0 };
let projectCache = process.env.AG_PROJECT_ID || null;

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.exp > now + 60_000) return tokenCache.token;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: env("AG_REFRESH_TOKEN"),
    client_id: env("AG_CLIENT_ID"),
    client_secret: env("AG_CLIENT_SECRET"),
  });
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    throw new Error(`Token refresh failed: HTTP ${r.status} ${j.error || ""} ${j.error_description || ""}`.trim());
  }
  tokenCache = { token: j.access_token, exp: now + (j.expires_in || 3600) * 1000 };
  return tokenCache.token;
}

const METADATA = { ideType: "ANTIGRAVITY", platform: "PLATFORM_UNSPECIFIED", pluginType: "GEMINI" };

async function codeAssistPost(accessToken, action, payload) {
  const r = await fetch(`${BASE}/v1internal:${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": UA,
    },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  let j = null;
  try { j = JSON.parse(text); } catch {}
  if (!r.ok) throw new Error(`${action} failed: HTTP ${r.status} ${text.slice(0, 300)}`);
  return j;
}

export async function getProjectId(accessToken) {
  if (projectCache) return projectCache;
  const res = await codeAssistPost(accessToken, "loadCodeAssist", { metadata: METADATA });
  let project = null;
  const p = res?.cloudaicompanionProject;
  if (typeof p === "string" && p.trim()) project = p.trim();
  else if (p && typeof p === "object" && typeof p.id === "string") project = p.id.trim();
  if (!project) {
    let tierId = "legacy-tier";
    if (Array.isArray(res?.allowedTiers)) {
      for (const t of res.allowedTiers) {
        if (t && t.isDefault && t.id) { tierId = String(t.id).trim(); break; }
      }
    }
    // onboard, then re-read
    for (let attempt = 0; attempt < 6 && !project; attempt++) {
      const ob = await codeAssistPost(accessToken, "onboardUser", { tierId, metadata: METADATA });
      const op = ob?.cloudaicompanionProject;
      if (typeof op === "string" && op.trim()) project = op.trim();
      else if (op && typeof op === "object" && typeof op.id === "string") project = op.id.trim();
      if (!project && ob?.done) {
        const again = await codeAssistPost(accessToken, "loadCodeAssist", { metadata: METADATA });
        const ap = again?.cloudaicompanionProject;
        if (typeof ap === "string" && ap.trim()) project = ap.trim();
        else if (ap && typeof ap === "object" && typeof ap.id === "string") project = ap.id.trim();
      }
      if (!project) await new Promise((res2) => setTimeout(res2, 3000));
    }
  }
  if (!project) throw new Error("Could not resolve a Code Assist project for this account");
  projectCache = project;
  return project;
}

export async function fetchModels(accessToken, project) {
  const j = await codeAssistPost(accessToken, "fetchAvailableModels", { project });
  return j?.models || {};
}

// ---------- OpenAI <-> Code Assist translation ----------

export function toInnerRequest(openai) {
  const contents = [];
  let systemText = "";
  for (const m of openai.messages || []) {
    const text = typeof m.content === "string"
      ? m.content
      : Array.isArray(m.content)
        ? m.content.filter((p) => p && p.type === "text").map((p) => p.text || "").join("")
        : "";
    if (!text) continue;
    if (m.role === "system") { systemText += (systemText ? "\n" : "") + text; continue; }
    contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text }] });
  }
  if (contents.length === 0) contents.push({ role: "user", parts: [{ text: "Hello" }] });
  const inner = {
    contents,
    generationConfig: {
      temperature: openai.temperature ?? 1,
      topP: openai.top_p ?? 0.95,
      topK: 40,
      maxOutputTokens: Math.min(openai.max_tokens || openai.max_completion_tokens || 8192, 64000),
    },
    sessionId: globalThis.crypto.randomUUID(),
  };
  if (systemText) inner.systemInstruction = { parts: [{ text: systemText }] };
  return inner;
}

function mapFinish(reason) {
  switch (reason) {
    case "STOP": return "stop";
    case "MAX_TOKENS": return "length";
    case "SAFETY": case "RECITATION": case "PROHIBITED_CONTENT": return "content_filter";
    default: return "stop";
  }
}

function partsToText(parts) {
  return (parts || []).filter((p) => p && typeof p.text === "string" && !p.thought).map((p) => p.text).join("");
}

export function toOpenAIResponse(resp, model) {
  const r = resp?.response || resp || {};
  const cand = (r.candidates || [])[0] || {};
  const content = partsToText(cand.content?.parts);
  const u = r.usageMetadata || {};
  return {
    id: "chatcmpl-" + globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 24),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{
      index: 0,
      message: { role: "assistant", content },
      finish_reason: mapFinish(cand.finishReason),
    }],
    usage: {
      prompt_tokens: u.promptTokenCount || 0,
      completion_tokens: u.candidatesTokenCount || 0,
      total_tokens: u.totalTokenCount || 0,
    },
  };
}

export function normalizeModel(model) {
  if (!model) return "gemini-3.8-flash-medium";
  return model.startsWith("antigravity/") ? model.slice("antigravity/".length) : model;
}

export async function generateChat(openai, { stream }) {
  const accessToken = await getAccessToken();
  const project = await getProjectId(accessToken);
  const model = normalizeModel(openai.model);
  const inner = toInnerRequest(openai);
  const requestId = `agent/${globalThis.crypto.randomUUID()}/${Date.now()}/${globalThis.crypto.randomUUID()}/1`;
  const url = `${BASE}/v1internal:${stream ? "streamGenerateContent?alt=sse" : "generateContent"}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": UA,
    },
    body: JSON.stringify({
      project,
      model,
      userAgent: "antigravity",
      requestType: "agent",
      requestId,
      request: inner,
    }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Upstream HTTP ${r.status}: ${t.slice(0, 400)}`);
  }
  return { upstream: r, model };
}

// Parse one SSE chunk payload ({response:{...}}) into an OpenAI delta chunk (or null).
export function sseToOpenAIChunk(payload, model) {
  const r = payload?.response || payload || {};
  const cand = (r.candidates || [])[0];
  if (!cand) return null;
  const text = partsToText(cand.content?.parts);
  const out = {
    id: "chatcmpl-" + "stream",
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: null }],
  };
  if (text) out.choices[0].delta.content = text;
  if (cand.finishReason) out.choices[0].finish_reason = mapFinish(cand.finishReason);
  if (r.usageMetadata) {
    out.usage = {
      prompt_tokens: r.usageMetadata.promptTokenCount || 0,
      completion_tokens: r.usageMetadata.candidatesTokenCount || 0,
      total_tokens: r.usageMetadata.totalTokenCount || 0,
    };
  }
  if (!text && !cand.finishReason && !out.usage) return null;
  return out;
}

export function checkRelayKey(req) {
  const want = process.env.RELAY_API_KEY;
  if (!want) return true; // no key configured -> open (not recommended)
  const auth = req.headers["authorization"] || req.headers["Authorization"] || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : (req.headers["x-api-key"] || "");
  return key === want;
}
