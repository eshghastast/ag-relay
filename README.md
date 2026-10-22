# ag-relay — رله‌ی Antigravity

**استفاده از سهمیه‌ی Antigravity (مدل‌های Gemini و Claude) در همه‌ی برنامه‌ها — از داخل ایران، به‌صورت مستقیم**

Use your **Antigravity** model quota (Gemini 3.8 Flash, Claude Sonnet/Opus 4.6, GPT-OSS 120B)
from any **OpenAI-compatible** app — your own code, chat UIs, agent frameworks, anything that
accepts a custom `base_url` + API key.

`ag-relay` is a tiny, dependency-free translator: it takes OpenAI-style requests, refreshes a
Google OAuth access token for **your own account**, and calls the same Code Assist backend the
official Antigravity clients use, then translates the answers back to OpenAI format.


> Built and maintained by **KARA AI** — Telegram channel: [t.me/kara_ai_offer](https://t.me/kara_ai_offer) · Instagram: [@kara_ai_offer](https://instagram.com/kara_ai_offer). Step-by-step Persian tutorials live in the channel.

- **Cost:** $0. It runs on your quota and free hosting.
- **Two ways to run it:** locally on your machine, or as a serverless relay on Vercel
  (useful when your apps can't reach Google directly — e.g. geo-blocked networks).

## 🇮🇷 راهنمای فارسی

**Relay چیه؟** یه ابزار کوچیک و متن‌بازه که سهمیه‌ی Antigravity اکانت گوگلت (Gemini 3.8 Flash، ‏Claude Sonnet/Opus، ‏GPT-OSS) رو به یه آدرس استاندارد تبدیل می‌کنه تا هر برنامه‌ای که «OpenAI Compatible» قبول می‌کنه (مثل 9Router، ‏Claude Desktop، ‏zcode، ‏Cherry Studio و...) بتونه از داخل ایران به‌صورت مستقیم ازش استفاده کنه. هزینه‌ش صفره: روی سهمیه‌ی خودت و هاست رایگان کار می‌کنه.

**نصب سریع (بدون ترمینال):**
۱. صفحه‌ی ستاپ رو باز کن: [eshghastast.github.io/ag-relay](https://eshghastast.github.io/ag-relay/) — اعتبارنامه‌ی اپ Antigravity رو وارد کن، با گوگل وارد شو و «پک نصب» (توکن + کلید Relay + پسورد داشبورد) رو تحویل بگیر. همه‌چیز توی مرورگر خودت انجام می‌شه.
۲. دکمه‌ی **Deploy with Vercel** پایین‌تر رو بزن و مقادیر پک رو توی فرم Vercel وارد کن.
۳. داشبورد رو باز کن، پسورد رو بزن، کلید رو ثبت کن و یه مدل رو تست کن. تمام!

**شرط لازم:** یه اکانت گوگلِ دارای مجوز Antigravity — اکانت **Pro**، یا اکانت رایگانی که ریجنش کشور پشتیبانی‌شده‌ست و تأیید گوگل رو رد کرده. آموزش ساخت اکانت Vercel و تغییر ریجن، قدم‌به‌قدم توی کانال ماست.

**امنیت:** همه‌ی رازها فقط توی متغیرهای محیطی (Environment Variables) پروژه‌ی خودت ذخیره می‌شن، هیچ‌چیز توی کد نیست. توصیه‌ی جدی: Relay رو با یه **اکانت جدا** راه بنداز، نه اکانت اصلیت. جزئیات توی [SECURITY.md](SECURITY.md).

**هدف سرویس:** فقط برای دسترسی به سرویس‌هایی که ایران رو تحریم کردن؛ به هیچ وجه برای دور زدن اینترنت داخلی نیست.

📺 آموزش‌های کامل فارسی: کانال تلگرام [KARA AI](https://t.me/kara_ai_offer) · اینستاگرام [@kara_ai_offer](https://instagram.com/kara_ai_offer)

---

## Fastest setup — no terminal

1. Open the **setup page** (`setup.html` in this repo — serve it via GitHub Pages or just open the file): enter the Antigravity client credentials, click "Sign in with Google", paste the callback URL back, and the page hands you a ready pack: your refresh token plus an auto-generated `RELAY_API_KEY` and `DASH_PASSWORD`. Everything runs locally in your browser; nothing is stored or sent anywhere except Google.
2. Click the deploy button and paste the values into Vercel's env form:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Feshghastast%2Fag-relay&env=AG_REFRESH_TOKEN%2CAG_CLIENT_ID%2CAG_CLIENT_SECRET%2CRELAY_API_KEY%2CDASH_PASSWORD&envDescription=Paste%20the%20values%20from%20the%20Relay%20setup%20page%3A%20your%20Google%20refresh%20token%2C%20the%20Antigravity%20client%20credentials%2C%20and%20the%20generated%20relay%20key%20%2B%20dashboard%20password.&project-name=ag-relay&repository-name=ag-relay)

3. Open your deployment, unlock the dashboard with `DASH_PASSWORD`, save the relay key once — done.

## Quickstart — local

```bash
git clone <this repo> ag-relay && cd ag-relay   # Node 18+, no dependencies
AG_CLIENT_SECRET=... npm run login             # sign in with your Google account, paste the callback URL
npm run serve                                  # http://localhost:8787/v1
```

Then in your app:

- Base URL: `http://localhost:8787/v1`
- API key: anything (unless you set `relay_api_key` in the config — recommended if the port is reachable by others)
- Model: one of the IDs from `GET /v1/models`, e.g. `gemini-3.8-flash-medium`, `claude-sonnet-4-6`

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-3.8-flash-medium","messages":[{"role":"user","content":"Hello!"}]}'
```

Streaming (`"stream": true`) is supported.

## Quickstart — Vercel relay

1. Fork/clone this repo and import it into Vercel (it's a plain functions project — `api/`, `lib/`, `vercel.json`).
2. Run `npm run login` locally once to get your refresh token.
3. Set these project environment variables in Vercel:
   - `AG_REFRESH_TOKEN` — from `~/.ag-relay/config.json`
   - `AG_CLIENT_ID`, `AG_CLIENT_SECRET` — the client credentials (see below)
   - `RELAY_API_KEY` — invent a long random string; your apps must send it as `Authorization: Bearer <key>`
   - `AG_PROJECT_ID` — optional; speeds up cold starts (printed by `local-test.mjs`)
4. Deploy. Your endpoint is `https://<your-project>.vercel.app/v1`.

Keep the refresh token secret: whoever has it can spend your quota.

## Client credentials

The relay logs in through the public Antigravity desktop OAuth client
(`client_id` is the same one shipped in the official app and in open-source routers).
Desktop OAuth clients cannot keep a secret; the matching `client_secret` is distributed with
those clients. Provide it via the `AG_CLIENT_SECRET` environment variable — this repo does not
hardcode it. You can also register **your own** OAuth client in Google Cloud Console
(Desktop type, enable the Cloud Code API) and use its id/secret instead.

## Models

Whatever your account's Antigravity plan exposes. Typical set:

| Model ID | Notes |
|---|---|
| `gemini-3.8-flash-high` / `-medium` / `-low` | Native, fastest, huge context; higher = more thinking |
| `gemini-3.1-pro-high` / `-low`, `gemini-pro-agent` | Gemini Pro tiers |
| `claude-sonnet-4-6` | Best balance for coding |
| `claude-opus-4-6-thinking` | Strongest; burns the Claude pool fastest |
| `gpt-oss-120b-medium` | Open-weight fallback |

Quota is percentage-based and shared per model group (Gemini pool vs Claude+GPT pool),
with a short-window refresh and a weekly cap on paid plans; free plans refresh weekly.
There is no official token counter — heavy agent loops can drain a free account quickly.

## Honest warnings

- This talks to Google's internal Code Assist API the way the official client does, but it is
  **not an official client**. Routing your quota through third-party tooling may violate
  Google's terms and could get the account restricted. **Use a secondary account you can afford to lose.**
- The risk is per-account: it does not affect accounts you don't log in with.
- No telemetry, no middleman: requests go from wherever you run this straight to Google.

## Security

- All credentials (Google refresh token, OAuth client credentials, relay API
  key, dashboard password) are supplied through **environment variables** —
  see `.env.example`. Nothing secret belongs in source code or in git; the
  shipped `.gitignore` covers token/config files by default.
- Generate a long random `RELAY_API_KEY`, set a `DASH_PASSWORD`, and enable
  2FA on both your hosting account and the Google account the relay uses.
- Recommended: run the relay under a **dedicated** Google account that holds
  the Antigravity license rather than your main account.
- Full notes: [SECURITY.md](SECURITY.md).

## Layout

- `lib/core.js` — the whole translator (token refresh, project resolution, request/response mapping, SSE)
- `api/chat.js`, `api/models.js` — Vercel function entry points (`/v1/chat/completions`, `/v1/models`)
- `bin/ag-login.mjs` — interactive OAuth login → `~/.ag-relay/config.json`
- `bin/ag-serve.mjs` — local server (same core, Node `http`)
- `local-test.mjs` — end-to-end smoke test against the real backend using `./.tokens.json`

## License

MIT
