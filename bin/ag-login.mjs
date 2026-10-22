#!/usr/bin/env node
// Interactive login: sign in with YOUR Google account, paste the callback URL back.
// Stores a refresh token in ~/.ag-relay/config.json (mode 0600). Nothing leaves your machine
// except requests to Google's own endpoints.
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

const CLIENT_ID = process.env.AG_CLIENT_ID || "";
const CLIENT_SECRET = process.env.AG_CLIENT_SECRET || "";
const REDIRECT = "http://localhost:8080/callback";
const SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/cclog",
  "https://www.googleapis.com/auth/experimentsandconfigs",
].join(" ");

const b64u = (b) => b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const verifier = b64u(randomBytes(32));
const challenge = b64u(createHash("sha256").update(verifier).digest());
const state = b64u(randomBytes(24));

const params = new URLSearchParams({
  client_id: CLIENT_ID,
  response_type: "code",
  redirect_uri: REDIRECT,
  scope: SCOPES,
  state,
  access_type: "offline",
  prompt: "consent",
  code_challenge: challenge,
  code_challenge_method: "S256",
});

console.log("\n1) Open this link and sign in with the Google account you want to use:\n");
console.log(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
console.log("\n2) After approving, the browser will fail to load a localhost page — that's expected.");
console.log("   Copy the FULL address from the address bar and paste it here.\n");

const rl = createInterface({ input: process.stdin, output: process.stdout });
const pasted = (await rl.question("Callback URL (or just the code): ")).trim();
rl.close();

let code = pasted;
if (pasted.includes("code=")) {
  const u = new URL(pasted.replace(/^[^h]*/, "h")); // tolerate leading junk
  code = u.searchParams.get("code") || "";
  const gotState = u.searchParams.get("state");
  if (gotState && gotState !== state) { console.error("State mismatch — run login again."); process.exit(1); }
}
if (!code) { console.error("No code found in what you pasted."); process.exit(1); }
if (!CLIENT_ID) {
  console.error("\nAG_CLIENT_ID is not set. See README → 'Client credentials' for how to provide it.");
  process.exit(1);
}
if (!CLIENT_SECRET) {
  console.error("\nAG_CLIENT_SECRET is not set. See README → 'Client credentials' for how to provide it.");
  process.exit(1);
}

const r = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    code_verifier: verifier,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT,
  }),
});
const j = await r.json().catch(() => ({}));
if (!r.ok || !j.refresh_token) {
  console.error(`Token exchange failed: HTTP ${r.status} ${j.error || ""} ${j.error_description || ""}`.trim());
  if (r.ok && !j.refresh_token) console.error("Google returned no refresh token — revoke the app at myaccount.google.com/permissions and retry.");
  process.exit(1);
}

const dir = join(homedir(), ".ag-relay");
mkdirSync(dir, { recursive: true });
const file = join(dir, "config.json");
writeFileSync(file, JSON.stringify({ refresh_token: j.refresh_token, client_id: CLIENT_ID, client_secret: CLIENT_SECRET }, null, 2), { mode: 0o600 });
console.log(`\nSaved. Config: ${file}`);
console.log("Next: `npm run serve` for a local endpoint, or deploy to Vercel (see README).");
