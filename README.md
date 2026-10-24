<div align="center">

# ⚡ ag-relay — رله‌ی Antigravity

### استفاده از سهمیه‌ی Antigravity در همه‌ی برنامه‌ها — از داخل ایران، به‌صورت مستقیم

**Gemini 3.8 Flash · Claude Sonnet 4.6 · Claude Opus 4.6 · GPT-OSS 120B**

<p>
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy on Vercel">
  <img src="https://img.shields.io/badge/API-OpenAI_Compatible-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI Compatible">
  <img src="https://img.shields.io/badge/Cost-Free-2ea44f?style=for-the-badge" alt="Free">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
</p>
<p>
  <a href="https://eshghastast.github.io/ag-relay/setup.html"><img src="https://img.shields.io/badge/🧰_Setup_page-no_terminal_needed-2456d6?style=for-the-badge" alt="Setup page"></a>
  <a href="https://t.me/kara_ai_offer"><img src="https://img.shields.io/badge/📺_Tutorials-Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram tutorials"></a>
</p>

</div>

Use your **Antigravity** model quota (Gemini 3.8 Flash, Claude Sonnet/Opus 4.6, GPT-OSS 120B)
from any **OpenAI-compatible** app — your own code, chat UIs, agent frameworks, anything that
accepts a custom `base_url` + API key.

`ag-relay` is a tiny, dependency-free translator: it takes OpenAI-style requests, refreshes a
Google OAuth access token for **your own account**, and calls the same Code Assist backend the
official Antigravity clients use, then translates the answers back to OpenAI format.


> Built and maintained by **KARA AI** — Telegram channel: [t.me/kara_ai_offer](https://t.me/kara_ai_offer) · Instagram: [@kara_ai_offer](https://instagram.com/kara_ai_offer). Step-by-step Persian tutorials live in the channel.

- **Cost:** $0. It runs on your quota and free hosting.
- **Three ways to run it:** locally on your machine, in Docker on your own VPS
  (always-on server), or as a serverless relay on Vercel
  (useful when your apps can't reach Google directly — e.g. geo-blocked networks).


## ✨ امکانات

| | |
|---|---|
| 🚀 **سریع** — مسیر کوتاه تا بک‌اند رسمی گوگل، با استریم زنده (SSE) | 📊 **داشبورد فارسی** — سهمیه‌ی هر دو استخر، وضعیت و راهنمای قدم‌به‌قدم |
| 🔒 **امن** — همه‌ی رازها فقط توی متغیرهای محیطی؛ هیچ‌چیز توی کد نیست | 💬 **چت داخلی** — مکالمه‌ی چندنوبتی با ذخیره‌ی خودکار تا ۳۰ گفت‌وگو |
| 🧪 **تست مدل‌ها** — تست تکی یا «تست همه» با زمان پاسخ و وضعیت هر مدل | 📈 **آمار مصرف** — شمارنده‌ی دائمی درخواست‌ها به تفکیک مدل |
| 🧰 **نصب بدون ترمینال** — صفحه‌ی ستاپ + دکمه‌ی دیپلوی یک‌کلیکه | 🌗 **دو تم** — حالت روشن و تیره، کاملاً ریسپانسیو |

## 🇮🇷 راهنمای فارسی

**Relay چیه؟** یه ابزار کوچیک و متن‌بازه که سهمیه‌ی Antigravity اکانت گوگلت (Gemini 3.8 Flash، ‏Claude Sonnet/Opus، ‏GPT-OSS) رو به یه آدرس استاندارد تبدیل می‌کنه تا هر برنامه‌ای که «OpenAI Compatible» قبول می‌کنه (مثل 9Router، ‏Claude Desktop، ‏zcode، ‏Cherry Studio و...) بتونه از داخل ایران به‌صورت مستقیم ازش استفاده کنه. هزینه‌ش صفره: روی سهمیه‌ی خودت و هاست رایگان کار می‌کنه.

**نصب سریع (بدون ترمینال):**
۱. صفحه‌ی ستاپ رو باز کن: [eshghastast.github.io/ag-relay](https://eshghastast.github.io/ag-relay/setup.html) — اعتبارنامه‌ی اپ Antigravity رو وارد کن، با گوگل وارد شو و «پک نصب» (توکن + کلید Relay + پسورد داشبورد) رو تحویل بگیر. همه‌چیز توی مرورگر خودت انجام می‌شه.
۲. دکمه‌ی **Deploy with Vercel** پایین‌تر رو بزن و مقادیر پک رو توی فرم Vercel وارد کن.
۳. داشبورد رو باز کن، پسورد رو بزن، کلید رو ثبت کن و یه مدل رو تست کن. تمام!

**شرط لازم:** یه اکانت گوگلِ دارای مجوز Antigravity — اکانت **Pro**، یا اکانت رایگانی که ریجنش کشور پشتیبانی‌شده‌ست و تأیید گوگل رو رد کرده. آموزش ساخت اکانت Vercel و تغییر ریجن، قدم‌به‌قدم توی کانال ماست.

**امنیت:** همه‌ی رازها فقط توی متغیرهای محیطی (Environment Variables) پروژه‌ی خودت ذخیره می‌شن، هیچ‌چیز توی کد نیست. توصیه‌ی جدی: Relay رو با یه **اکانت جدا** راه بنداز، نه اکانت اصلیت. جزئیات توی [SECURITY.md](SECURITY.md).

**هدف سرویس:** فقط برای دسترسی به سرویس‌هایی که ایران رو تحریم کردن؛ به هیچ وجه برای دور زدن اینترنت داخلی نیست.

📺 آموزش‌های کامل فارسی: کانال تلگرام [KARA AI](https://t.me/kara_ai_offer) · اینستاگرام [@kara_ai_offer](https://instagram.com/kara_ai_offer)

---

## ⚡ Fastest setup — no terminal

1. Open the **setup page** (`setup.html` in this repo — serve it via GitHub Pages or just open the file): enter the Antigravity client credentials, click "Sign in with Google", paste the callback URL back, and the page hands you a ready pack: your refresh token plus an auto-generated `RELAY_API_KEY` and `DASH_PASSWORD`. Everything runs locally in your browser; nothing is stored or sent anywhere except Google.
2. Click the deploy button and paste the values into Vercel's env form:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Feshghastast%2Fag-relay&env=AG_REFRESH_TOKEN%2CAG_CLIENT_ID%2CAG_CLIENT_SECRET%2CRELAY_API_KEY%2CDASH_PASSWORD&envDescription=Paste%20the%20values%20from%20the%20Relay%20setup%20page%3A%20your%20Google%20refresh%20token%2C%20the%20Antigravity%20client%20credentials%2C%20and%20the%20generated%20relay%20key%20%2B%20dashboard%20password.&project-name=ag-relay&repository-name=ag-relay)

3. Open your deployment, unlock the dashboard with `DASH_PASSWORD`, save the relay key once — done.

**Vercel deploy tips (from a real first run):**
- In **Vercel Team**, pick your existing personal scope (**Hobby**) — never "Create a Team": new teams are **Pro (paid)** only.
- **Git Scope** must be a GitHub account connected to that Vercel account (usually the one you signed up with), with the Vercel GitHub app installed. If the list is empty, install/authorize the app and grant **All repositories** — Vercel needs it to create your copy.
- Your copy is created as a **private** repo under your account — expected; the original template repo stays public.

## 🖥️ Quickstart — local

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

## 🐳 Docker + VPS شخصی — سرور همیشه‌روشن خودت

اگه Vercel نمی‌خوای و یه VPS داری (یا همین روش رو روی کامپیوتر خودت می‌خوای)، با داکر
بدون فایل کانفیگ بالا میاد — فقط متغیرهای محیطی:

```bash
git clone https://github.com/eshghastast/ag-relay.git && cd ag-relay
cp .env.example .env   # مقادیر پک ستاپ (توکن + کلید Relay) رو توش بنویس؛ هرگز کامیتش نکن
docker compose up -d --build
```

یا تک‌دستوری، بدون فایل:

```bash
docker build -t ag-relay .
docker run -d --name ag-relay --restart unless-stopped -p 8787:8787 \
  -e AG_REFRESH_TOKEN=... -e AG_CLIENT_ID=... -e AG_CLIENT_SECRET=... \
  -e RELAY_API_KEY=... ag-relay
```

بعد توی هر برنامه‌ی OpenAI-Compatible:

- Base URL: `http://<IPسرورت>:8787/v1`
- API key: همون `RELAY_API_KEY`

نکته‌ها: پورت 8787 رو توی فایروال VPS باز کن؛ `AG_PROJECT_ID` رو خالی بذار (خودکار
پیدا می‌شه)؛ برای استفاده‌ی جدی، حتماً `RELAY_API_KEY` بذار — بدون کلید، رله روی
پورت باز همه‌ی درخواست‌ها رو رد می‌کنه. لاگ: `docker logs -f ag-relay`.

## ☁️ Quickstart — Vercel relay

1. Fork/clone this repo and import it into Vercel (it's a plain functions project — `api/`, `lib/`, `vercel.json`).
2. Run `npm run login` locally once to get your refresh token.
3. Set these project environment variables in Vercel:
   - `AG_REFRESH_TOKEN` — from `~/.ag-relay/config.json`
   - `AG_CLIENT_ID`, `AG_CLIENT_SECRET` — the client credentials (see below)
   - `RELAY_API_KEY` — invent a long random string; your apps must send it as `Authorization: Bearer <key>`. Required: without it the relay refuses all `/v1` requests (fail closed); `RELAY_OPEN=1` only for an intentionally open local dev relay.
   - `AG_PROJECT_ID` — optional; speeds up cold starts. **Leave it unset (recommended)** — the relay auto-resolves your account's managed Code Assist project (e.g. `aicode-consumers`). ⚠️ Never set it to the Google Cloud project that hosts your OAuth client: the private Cloud Code API can never be enabled on a personal project (Google returns `PERMISSION_DENIED`), so the relay dies with a misleading "Cloud Code Private API is not enabled in your project" error. Only set this if you know your *managed* project ID for sure.
4. Deploy. Your endpoint is `https://<your-project>.vercel.app/v1`.

Keep the refresh token secret: whoever has it can spend your quota.

## ☁️ Netlify — پورت دوم (Functions)

اگه Vercel نمی‌خوای ولی همچنان سرورلس می‌خوای، همون کد روی Netlify Functions هم
اجرا می‌شه — بدون کپی منطق: هر فانکشن Netlify فقط یه wrapper نازک دور همون
هندلرهای `api/`ـه (`netlify/functions/` + آداپتور `netlify/lib/adapter.mjs`):

1. ریپو رو توی Netlify ایمپورت کن (Import from Git). Netlify خودش `netlify.toml`
   رو می‌خونه: فانکشن‌ها از `netlify/functions/` و مسیرهای `/v1/...` بهشون وصل می‌شن.
2. توی Site settings → Environment variables همون متغیرها رو بذار:
   - `AG_REFRESH_TOKEN` — از `~/.ag-relay/config.json` (بعد از `npm run login`)
   - `AG_CLIENT_ID`, `AG_CLIENT_SECRET` — (بخش Client credentials پایین)
   - `RELAY_API_KEY` — کلید خودت؛ بدون اون رله همه‌ی درخواست‌ها رو رد می‌کنه
   - `DASH_PASSWORD` — پسورد داشبورد (`/`)
   - `AG_PROJECT_ID` — **خالی بذار** (خودکار پیدا می‌شه؛ همون هشدار Vercel این‌جا هم برقراره)
3. Deploy. آدرس: `https://<your-site>.netlify.app/v1`.

تفاوت‌ها با Vercel:
- استریم چت کار می‌کنه ولی بافری برمی‌گرده: جواب کامل که آماده شد، کل SSE یک‌جا
  فرستاده می‌شه (نه توکن‌به‌توکن). برای استریم واقعی، مسیر Docker/VPS رو ببین.
- آمار مصرف (`/api/stats`) روی Netlify در دسترس نیست — اون قسمت با Vercel Blob
  کار می‌کنه و این‌جا `available: false` برمی‌گردونه. خود رله و داشبورد کامل کار می‌کنن.
- سقف اجرای فانکشن‌های سینک Netlify ۶۰ ثانیه‌ست (مثل Vercel)؛ نسل‌های خیلی طولانی
  ممکنه بهش بخورن — اون‌وقت هم مسیر Docker/VPS جوابه.

## ☁️ Cloudflare Workers — پورت سوم

اگه دنبال لبه‌ی جهانی و استریم واقعی هستی، همون کد روی Cloudflare Workers هم
اجرا می‌شه — ورودی `cloudflare/worker.mjs` + آداپتور `cloudflare/lib/adapter.mjs`
که هندلرهای `api/` رو پشت fetch()‎ استاندارد Workers می‌نشونه (بدون کپی منطق):

1. Wrangler رو نصب کن: `npm install -g wrangler` (یا `npx wrangler`).
2. سکرت‌ها رو بذار — مقادیر واقعی هرگز توی فایل نمی‌رن:
   ```bash
   wrangler secret put AG_REFRESH_TOKEN
   wrangler secret put AG_CLIENT_ID
   wrangler secret put AG_CLIENT_SECRET
   wrangler secret put RELAY_API_KEY
   wrangler secret put DASH_PASSWORD
   ```
   (`AG_PROJECT_ID` رو **خالی بذار** — خودکار پیدا می‌شه؛ همون هشدار Vercel.)
3. `npm install` (برای باندل‌شدن وابستگی‌ها) بعد `wrangler deploy`.
   آدرس: `https://ag-relay.<subdomain-شما>.workers.dev/v1`.

تفاوت‌ها با Vercel و Netlify:
- استریم واقعی: برخلاف Netlify که جواب رو بافر می‌کنه، این‌جا SSE توکن‌به‌توکن
  از استریم Response رد می‌شه.
- آمار مصرف (`/api/stats`) این‌جا هم `available: false`ـه — با Vercel Blob کار
  می‌کنه که روی Workers نیست. رله و داشبورد کامل کار می‌کنن.
- محدودیت‌های Workers (مستندات رسمی Cloudflare): پلن رایگان ۱۰۰٬۰۰۰ درخواست
  در روز، ۱۲۸ مگابایت حافظه و ۵۰ ساب‌ری‌کوئست به‌ازای هر درخواست می‌ده. سقف CPU
  روی Free فقط ۱۰ میلی‌ثانیه‌ست — ولی CPU یعنی زمان پردازش، نه انتظار I/O:
  رله بیش‌تر وقتش رو منتظر گوگل می‌مونه، پس زمان نسل به سقف نمی‌خوره؛ چیزی که
  CPU می‌خوره ترجمه‌ی JSON هر چانکه، پس نسل‌های خیلی طولانی ممکنه روی Free به
  سقف بخورن. پلن Paid تا ۵ دقیقه CPU می‌ده.
- نکته‌ی فنی: چون `lib/core.js` از `node:crypto` و `process.env` استفاده
  می‌کنه، `wrangler.toml` فلگ `nodejs_compat` رو فعال می‌کنه و ورودی Worker
  متغیرهای binding رو قبل از لود هندلرها توی `process.env` می‌نشونه. دیپلوی
  واقعی با `wrangler deploy` هنوز برای تأیید نهایی لازمه (مخصوصاً باندل‌شدن
  `@vercel/blob` که فقط برای stats استفاده می‌شه).

## 🔄 به‌روزرسانی (بدون حذف و نصب دوباره)

برای به‌روز کردن یه دیپلوی موجود، هرگز پروژه رو پاک و دوباره نصب نکن:

- اگه پروژه‌ت به گیت‌هاب وصله (نصب با Deploy Button یا Import from Git)، هر پوش روی `master` خودش یه ریدیپلوی خودکار می‌سازه — نسخه‌ی جدید خودبه‌خود میاد بالا.
- اگه پروژه‌ت به گیت وصل نیست، توی داشبورد هاست دکمه‌ی Redeploy رو بزن.
- تغییر متغیرهای محیطی (env) هم برای اعمال شدن یه ریدیپلوی می‌خواد.
- داشبورد نسخه‌ی نصب‌شده رو توی فوتر نشون می‌ده و با دکمه‌ی «بررسی به‌روزرسانی» می‌تونی ببینی نسخه‌ی جدید در ریپو هست یا نه (مقایسه با آخرین کامیت `master` در گیت‌هاب).

## 🔑 Client credentials

The relay logs in through the public Antigravity desktop OAuth client
(`client_id` is the same one shipped in the official app and in open-source routers).
Desktop OAuth clients cannot keep a secret; the matching `client_secret` is distributed with
those clients. Provide it via the `AG_CLIENT_SECRET` environment variable — this repo does not
hardcode it. You can also register **your own** OAuth client in Google Cloud Console
(Desktop type, enable the Cloud Code API) and use its id/secret instead — the full
step-by-step walkthrough is in the setup page (step 1, method 2).

## 🤖 Models

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

## ⚠️ Honest warnings

- This talks to Google's internal Code Assist API the way the official client does, but it is
  **not an official client**. Routing your quota through third-party tooling may violate
  Google's terms and could get the account restricted. **Use a secondary account you can afford to lose.**
- The risk is per-account: it does not affect accounts you don't log in with.
- No telemetry, no middleman: requests go from wherever you run this straight to Google.

## 🔐 Security

- All credentials (Google refresh token, OAuth client credentials, relay API
  key, dashboard password) are supplied through **environment variables** —
  see `.env.example`. Nothing secret belongs in source code or in git; the
  shipped `.gitignore` covers token/config files by default.
- Generate a long random `RELAY_API_KEY`, set a `DASH_PASSWORD`, and enable
  2FA on both your hosting account and the Google account the relay uses.
- Recommended: run the relay under a **dedicated** Google account that holds
  the Antigravity license rather than your main account.
- Full notes: [SECURITY.md](SECURITY.md).

## 🗂️ Layout

- `lib/core.js` — the whole translator (token refresh, project resolution, request/response mapping, SSE)
- `api/chat.js`, `api/models.js` — Vercel function entry points (`/v1/chat/completions`, `/v1/models`)
- `netlify/functions/`, `netlify/lib/adapter.mjs`, `netlify.toml` — the Netlify port: thin wrappers over the same `api/` handlers, same URLs
- `cloudflare/worker.mjs`, `cloudflare/lib/adapter.mjs`, `wrangler.toml` — the Workers port: same `api/` handlers behind fetch(), with true SSE streaming
- `bin/ag-login.mjs` — interactive OAuth login → `~/.ag-relay/config.json`
- `bin/ag-serve.mjs` — local server (same core, Node `http`)
- `local-test.mjs` — end-to-end smoke test against the real backend using `./.tokens.json`

## 📄 License

MIT
