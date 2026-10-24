export const config = { maxDuration: 30 };

// Dashboard shell: sidebar + header + footer layout, dark/light themes,
// responsive. Contains NO data — everything loads from /api/status-data
// after the in-page password popup unlock (DASH_PASSWORD, sessionStorage).
export default async function handler(req, res) {
  const host = req.headers.host || "localhost";
  const endpoint = "https://" + host + "/v1";
  const brand = process.env.DASH_BRAND || "Relay";
  const igUrl = process.env.DASH_INSTAGRAM_URL || "";
  const igLabel = process.env.DASH_INSTAGRAM_LABEL || "Instagram";
  const tgUrl = process.env.DASH_TELEGRAM_URL || "";
  const ghUrl = process.env.DASH_GITHUB_URL || "";
  const socials = [
    igUrl ? '<a href="' + igUrl + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>' + igLabel + '</a>' : "",
    tgUrl ? '<a href="' + tgUrl + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M21.9 4.4 18.8 19c-.2 1-.8 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.8 8.7-7.9c.4-.3-.1-.5-.6-.2L6.6 13.6 1.9 12.1c-1-.3-1-1 .2-1.5l18.4-7.1c.9-.3 1.6.2 1.4.9z"/></svg>Telegram</a>' : "",
    ghUrl ? '<a href="' + ghUrl + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 1.7.8.5 1.7 0 1.1-.5 3.4 0 0 .1 1 .8.2 4.6-1.5 7.9-5.9 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>GitHub</a>' : "",
  ].filter(Boolean).join("");
  const html = `<!doctype html>
<html lang="fa" dir="rtl" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${brand} — داشبورد</title>
<style>
  :root{
    --bg:#0b0e14; --panel:#12172a; --panel2:#0f1424; --border:#1f2740; --text:#e6e6e6;
    --dim:#8b94a3; --accent:#1d4ed8; --accent2:#2563eb; --code:#1a2030; --overlay:rgba(4,6,12,.92);
    --shadow:0 1px 2px rgba(0,0,0,.35),0 6px 18px rgba(0,0,0,.25);
  }
  [data-theme="light"]{
    --bg:#edf0f5; --panel:#ffffff; --panel2:#f5f7fb; --border:#dbe1ec; --text:#1b2432;
    --dim:#5d6b82; --accent:#2456d6; --accent2:#1d4ed8; --code:#eef2f8; --overlay:rgba(27,36,50,.45);
    --shadow:0 1px 2px rgba(16,24,40,.07),0 6px 18px rgba(16,24,40,.07);
  }
  *{box-sizing:border-box}
  body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);margin:0}
  header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 22px;background:var(--panel);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:20;box-shadow:var(--shadow)}
  .brand{font-size:20px;font-weight:700}
  .brand .dim{font-weight:400}
  .head-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .iconbtn{background:var(--panel2);border:1px solid var(--border);border-radius:9px;padding:7px 12px;cursor:pointer;color:var(--text);font:inherit}
  .iconbtn:hover{border-color:var(--accent)}
  .keybar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 22px;background:var(--panel);border-bottom:1px solid var(--border)}
  .keybar input{flex:1;min-width:220px}
  .endpointbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 22px;background:var(--panel2);border-bottom:1px solid var(--border);font-size:15px}
  .endpointbar code{font-size:14px;padding:4px 10px}
  .socials{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  .socials a{color:var(--dim);text-decoration:none;display:inline-flex;gap:6px;align-items:center}
  .socials a:hover{color:var(--text)}
  .socials svg{width:18px;height:18px;fill:currentColor}
  .layout{display:flex;align-items:stretch;min-height:calc(100vh - 190px)}
  #sidebar{width:210px;flex:0 0 210px;background:var(--panel);border-inline-end:1px solid var(--border);padding:16px 12px;display:flex;flex-direction:column;gap:6px}
  .navbtn{display:flex;gap:8px;align-items:center;background:transparent;border:1px solid transparent;color:var(--text);text-align:start;padding:10px 12px;border-radius:10px;cursor:pointer;font:inherit;font-size:15px}
  .navbtn:hover{background:var(--panel2)}
  .navbtn.active{background:var(--accent);color:#fff}
  main{flex:1;padding:22px;min-width:0}
  footer{padding:16px 22px;border-top:1px solid var(--border);color:var(--dim);font-size:13px;display:flex;gap:14px;flex-wrap:wrap;justify-content:space-between;background:var(--panel)}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:14px}
  .card{background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:20px;margin:0 0 14px;box-shadow:var(--shadow)}
  .grid .card{margin:0}
  h2{font-size:16px;margin:0 0 10px}
  .dim{color:var(--dim);font-size:13px}
  .ok{color:#4ade80}.bad{color:#f87171}
  .bar{height:12px;background:var(--code);border-radius:99px;overflow:hidden;margin:8px 0}
  .fill{height:100%;border-radius:99px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  td,th{padding:7px 6px;border-bottom:1px solid var(--border);text-align:start}
  code{background:var(--code);padding:2px 7px;border-radius:6px;direction:ltr;display:inline-block;font-size:12px}
  input,select,button{font:inherit;border-radius:10px;border:1px solid var(--border);background:var(--panel2);color:var(--text);padding:9px 12px}
  input:focus,select:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent)}
  button{background:var(--accent);border-color:var(--accent);color:#fff;cursor:pointer}
  button:hover{background:var(--accent2)}
  button.ghost{background:var(--panel2);color:var(--text);border-color:var(--border)}
  .row{display:flex;gap:8px;flex-wrap:wrap}.row>*{flex:1}
  .small{flex:0 0 auto}
  summary{cursor:pointer;color:#93c5fd}
  .banner{background:#3a1620;border:1px solid #7f1d2d;color:#fca5a5;border-radius:12px;padding:12px 14px;margin:0 0 14px;font-size:14px}
  [data-theme="light"] .banner{background:#fde8e8;color:#8a1f1f}
  .chatlog{display:flex;flex-direction:column;gap:8px;max-height:420px;overflow-y:auto;margin:10px 0}
  .bubble{padding:9px 12px;border-radius:12px;max-width:88%;white-space:pre-wrap;word-break:break-word;font-size:14px;line-height:1.7}
  .bubble.u{align-self:flex-start;background:var(--accent);color:#fff}
  .bubble.a{align-self:flex-end;background:var(--code)}
  .bubble .meta{display:block;font-size:11px;color:var(--dim);margin-top:4px}
  .cfgbtns{display:flex;gap:8px;flex-wrap:wrap}
  #lockOverlay{position:fixed;inset:0;background:var(--overlay);display:flex;align-items:center;justify-content:center;z-index:50}
  .lockbox{background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:28px;width:min(340px,88vw);text-align:center}
  .lockbox input{width:100%;margin:12px 0;text-align:center}
  .lockbox button{width:100%}
  #lockErr{color:#f87171;font-size:13px;min-height:18px}
  .chatitem{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;margin:0 0 6px;background:var(--panel2)}
  .chatitem.cur{border-color:var(--accent)}
  .chatitem .ctitle{flex:1;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .steps{display:flex;flex-direction:column;gap:10px;margin:14px 0}
  .step{display:flex;gap:12px;align-items:flex-start;background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
  .stepnum{flex:0 0 30px;width:30px;height:30px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px}
  .step p{margin:3px 0 0}
  .pools{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
  .pool{flex:1;min-width:210px;background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
  .pool b{display:block;margin-bottom:4px}
  details.faq{border:1px solid var(--border);border-radius:12px;padding:13px 15px;margin:0 0 10px;background:var(--panel2)}
  details.faq summary{font-weight:700;cursor:pointer;list-style:none}
  details.faq[open] summary{margin-bottom:8px}
  details.faq p{line-height:1.9}
  .hidden{display:none !important}
  @media (max-width: 860px){
    .layout{flex-direction:column}
    #sidebar{width:auto;flex:0 0 auto;flex-direction:row;overflow-x:auto;border-inline-end:none;border-bottom:1px solid var(--border);padding:10px}
    .navbtn{white-space:nowrap}
    main{padding:14px}
    header,.keybar{padding-inline:14px}
  }
</style>
</head>
<body>
<div id="lockOverlay">
  <div class="lockbox">
    <div style="font-size:34px">🔒</div>
    <h2>داشبورد ${brand}</h2>
    <p class="dim">پسورد داشبورد رو وارد کن</p>
    <input id="passInput" type="password" placeholder="پسورد" autocomplete="current-password">
    <button id="unlockBtn">ورود</button>
    <p id="lockErr"></p>
  </div>
</div>

<div id="app" class="hidden">
  <header>
    <div class="brand">⚡ ${brand} <span class="dim">داشبورد مدیریت</span></div>
    <div class="head-actions">
      <span><span id="healthDot">●</span> <span id="healthLine" class="dim">...</span></span>
      <button class="iconbtn" id="themeBtn" title="تم روشن/تیره">☀️</button>
      <button class="iconbtn" id="lockBtn" title="قفل کردن داشبورد">🔒 خروج</button>
    </div>
  </header>

  <div class="keybar">
    <span>🔑 کلید Relay:</span>
    <input id="key" type="password" placeholder="sk-relay-...">
    <button id="saveKey" class="small">ثبت</button>
    <span id="keyMsg" class="dim">یه بار ثبتش کن؛ برای تست مدل‌ها، آمار، چت و کانفیگ استفاده می‌شه.</span>
  </div>

  <div class="endpointbar">
    <span>🌐 آدرس اتصال (Endpoint):</span>
    <code>${endpoint}</code>
    <button class="ghost small" id="copyEndpoint">📋 کپی آدرس</button>
    <span class="dim">این آدرس رو توی هر برنامه‌ای که می‌خوای وصل کنی وارد می‌کنی.</span>
  </div>

  <div class="layout">
    <aside id="sidebar">
      <button class="navbtn active" data-nav="overview">📊 نمای کلی</button>
      <button class="navbtn" data-nav="models">🤖 مدل‌ها و تست</button>
      <button class="navbtn" data-nav="config">📋 کانفیگ اپ‌ها</button>
      <button class="navbtn" data-nav="stats">📈 آمار مصرف</button>
      <button class="navbtn" data-nav="chat">💬 چت</button>
    </aside>

    <main>
      <section class="view" id="view-overview">
        <div class="card">
          <h2>🚀 راهنمای شروع سریع</h2>
          <p>این داشبورد، صفحه‌ی مدیریت <b>Relay</b> توئه؛ یه پل که برنامه‌های روی کامپیوترت رو از داخل ایران، <b>به‌صورت مستقیم</b>، به مدل‌های هوش مصنوعی گوگل (Gemini و Claude) وصل می‌کنه.</p>
          <div class="steps">
            <div class="step"><span class="stepnum">۱</span><p>کلید Relay رو توی نوار بالای صفحه وارد کن و «ثبت» رو بزن.</p></div>
            <div class="step"><span class="stepnum">۲</span><p>از بخش «کانفیگ اپ‌ها» کانفیگ برنامه‌ت رو کپی کن و توی اون برنامه پیست کن.</p></div>
            <div class="step"><span class="stepnum">۳</span><p>تمام! برنامه‌ت وصل شد و می‌تونی از مدل‌ها استفاده کنی.</p></div>
          </div>
          <p class="dim">📌 اکانت Vercel نداری؟ یا ریجن اکانت گوگلت ایرانه؟ آموزش ساخت اکانت Vercel و آموزش تغییر ریجن رو توی <b>کانال تلگرام</b> و <b>هایلایت‌های پیج اینستاگرام</b> گذاشتیم — اول اونا رو ببین، بعد بیا این‌جا.</p>
          <h2 style="margin-top:18px">📊 سهمیه چیه؟</h2>
          <p>پایین همین صفحه سهمیه‌ی باقی‌مونده‌ت رو می‌بینی. سهمیه یعنی مقدار مصرف مجازی که گوگل می‌ده و <b>هر هفته از نو پر می‌شه</b>. دو تا انبار جدا داری و تموم شدن یکیش روی اون‌یکی اثری نداره:</p>
          <div class="pools">
            <div class="pool"><b>🟢 انبار Gemini</b>برای مدل‌های Gemini — معمولاً پرتره و برای استفاده‌ی روزمره عالیه.</div>
            <div class="pool"><b>🟣 انبار Claude + GPT</b>برای مدل‌های Claude و GPT — زودتر خالی می‌شه؛ برای کارهای مهم نگهش دار.</div>
          </div>
        </div>
        <div id="bannerZone"></div>
        <div id="groupsZone" class="grid"><p class="dim">در حال خواندن سهمیه‌ها و مدل‌ها...</p></div>

        <div class="card">
          <h2>❓ سوالات متداول</h2>
          <details class="faq">
            <summary>🔑 آموزش گرفتن کلید Relay</summary>
            <p>«کلید Relay» یه رمز اختصاصیه که فقط خودت داری؛ هر برنامه‌ای بخواد از Relay استفاده کنه باید این کلید رو داشته باشه، وگرنه جواب نمی‌گیره. برای گرفتن و استفاده‌ش:</p>
            <p>۱. کلید رو موقع نصب Relay خودت ساختی و توی تنظیمات پروژه‌ت هست (متغیر RELAY_API_KEY). اگه گمش کردی، از همون‌جا می‌تونی پیداش کنی یا یه کلید تازه بسازی و جایگزین کنی.<br>
            ۲. کلید رو توی نوار بالای همین داشبورد وارد کن و «ثبت» رو بزن — یه بار برای همیشه.<br>
            ۳. توی برنامه‌ها هم همون کلید رو توی قسمت API Key وارد می‌کنی (از بخش «کانفیگ اپ‌ها» آماده کپی می‌شه).<br>
            ۴. کلید رو دست کسی نده؛ هرکی داشته باشه می‌تونه از سهمیه‌ت استفاده کنه. اگه حس کردی لو رفته، فوراً یه کلید تازه بساز و توی تنظیمات پروژه جایگزین کن (کلید قبلی خودکار باطل می‌شه).</p>
          </details>
          <details class="faq">
            <summary>👤 اکانت ساده با اکانت پرو چه فرقی می‌کنه؟</summary>
            <p>Relay با یه «اکانت گوگل» کار می‌کنه و قدرتش به همون اکانت بستگی داره:</p>
            <p><b>اکانت ساده (رایگان):</b> بله، با اکانت رایگان هم می‌تونی وصل بشی — به شرطی که اکانتت برای گوگل «واجد شرایط» باشه: یعنی ریجنش روی یه کشور پشتیبانی‌شده باشه و تأیید هویت گوگل رو رد کرده باشه. اگه ریجن اکانتت ایران باشه، گوگل وسط راه خطای «کشور پشتیبانی نمی‌شه» یا «باید حسابت تأیید بشه» می‌ده. خبر خوب: لازم نیست خودت درگیرش بشی — <b>آموزش تغییر ریجن</b> و <b>آموزش ساخت اکانت Vercel</b> رو قدم‌به‌قدم توی کانال تلگرام و هایلایت‌های پیج اینستاگرام گذاشتیم؛ با همونا اکانتت رو آماده کن و بعد وصل شو.</p>
            <p><b>اکانت پرو (Google AI Pro):</b> راحت‌ترین و کامل‌ترین حالت: مجوز کامل Antigravity داره، همه‌ی مدل‌ها (Gemini و Claude و GPT) بازن و یه سهمیه‌ی هفتگی سخاوتمندانه داره که توی دو انبار جدا (Gemini و Claude+GPT) هر هفته از نو پر می‌شه — بدون درگیری با خطای ریجن و تأیید.</p>
            <p><b>⚠️ توصیه‌ی مهم:</b> بهتره Relay رو با «اکانت اصلیت» راه نندازی. چون Relay یه ابزار شخصی و غیررسمیه، همیشه یه ریسک کوچیک هست که گوگل اکانت رو محدود کنه — و اگه اون اکانت، اکانت اصلیت باشه، همه‌ی سرویس‌های گوگلت آسیب می‌بینن. راه درستش اینه: یه اکانت جدا مخصوص Relay داشته باشی (مثلاً اکانتی که عضو خانواده‌ی اشتراک پرو شده) تا اگه مشکلی پیش اومد، فقط همون اکانت جدا درگیر بشه.</p>
          </details>
          <details class="faq">
            <summary>📌 هدف این سرویس چیه؟</summary>
            <p>این سرویس <b>فقط</b> برای دسترسی به سرویس‌ها و ابزارهایی ساخته شده که خودشون ایران رو تحریم کردن و به کاربر ایرانی سرویس نمی‌دن — یعنی مشکل از طرف اون‌هاست، نه اینترنت ایران. Relay یه پل فنیه تا بتونی از اشتراک و حساب قانونی خودت توی اون سرویس‌ها استفاده کنی.</p>
            <p>این سرویس <b>به هیچ وجه</b> برای دور زدن اینترنت داخلی یا فیلترینگ داخل کشور نیست و چنین کاربردی نداره. 🙂</p>
          </details>
        </div>
      </section>

      <section class="view hidden" id="view-models">
        <div class="card">
          <h2>🤖 مدل‌ها — تست تکی و گروهی</h2>
          <p class="dim">اینا همه‌ی مدل‌هایی هستن که الان واقعاً کار می‌کنن. دکمه‌ی «تست» کنار هر مدل، یه سؤال کوچیک ازش می‌پرسه تا مطمئن شی سالمه: 🟢 سالم و آماده‌ی استفاده · 🟡 بازنشسته شده و دیگه جواب واقعی نمی‌ده · 🔴 خطا داده (معمولاً یعنی سهمیه‌ی اون گروه تموم شده یا موقتاً در دسترس نیست). سرعت هر مدل هم بعد از تست کنارش نوشته می‌شه — هرچی کمتر، بهتر.</p>
          <button id="testAll">🩺 تست همه‌ی مدل‌ها</button>
          <div id="modelsTable" style="margin-top:12px"></div>
        </div>
      </section>

      <section class="view hidden" id="view-config">
        <div class="card">
          <h2>📋 کانفیگ اپ‌ها — وصل کردن برنامه‌ها به Relay</h2>
          <p>برای وصل کردن هر برنامه‌ای فقط <b>سه تا چیز</b> لازمه: <b>آدرس Relay</b> (Base URL)، <b>کلید Relay</b> (API Key) و <b>اسم مدل</b>. این صفحه همه رو آماده بهت می‌ده: یا هر کدوم رو جدا کپی کن، یا کانفیگ کامل یه برنامه رو یه‌جا بردار.</p>
          <div class="row">
            <label class="small" style="align-self:center">مدل پیش‌فرض:</label>
            <select id="cfgModel"></select>
            <button id="testConn" class="small ghost">🔌 تست اتصال</button>
          </div>
          <p id="connMsg" class="dim"></p>
          <div class="cfgbtns" style="margin-top:8px">
            <button class="ghost" data-copyfield="base">کپی آدرس</button>
            <button class="ghost" data-copyfield="key">کپی کلید</button>
            <button class="ghost" data-copyfield="model">کپی اسم مدل</button>
            <button class="ghost" id="dlEnv">⬇️ دانلود فایل ‎.env</button>
            <button class="ghost" id="dlJson">⬇️ دانلود فایل JSON</button>
          </div>
          <p id="cfgMsg" class="dim"></p>
        </div>

        <div class="card">
          <h2>🧭 راهنمای قدم‌به‌قدم هر برنامه</h2>
          <p class="dim">برنامه‌ت رو پیدا کن، قدم‌ها رو برو، آخرش دکمه‌ی کپی همون برنامه رو بزن و مقادیر رو سر جاشون پیست کن.</p>

          <details><summary><b>9Router</b> — برای مدیریت چند مدل و ساخت کمبو</summary>
            <p>۱. داشبورد 9Router رو باز کن و برو به بخش Providers.<br>
            ۲. «Add Provider» و بعد OpenAI Compatible رو انتخاب کن.<br>
            ۳. Name رو بذار agrelay و Prefix رو هم agrelay.<br>
            ۴. API Type رو بذار روی Chat Completions (خیلی مهمه؛ روی Responses کار نمی‌کنه).<br>
            ۵. Base URL و API Key رو از همین صفحه کپی و پیست کن.<br>
            ۶. ذخیره کن؛ مدل‌ها با پیشوند agrelay/ در دسترسن.</p>
            <button data-cfg="router">📋 کپی کانفیگ 9Router</button>
          </details>

          <details><summary><b>Claude Desktop</b> — چت دسکتاپ با مدل‌های Relay</summary>
            <p>۱. تنظیمات Claude Desktop رو باز کن و برو به بخش اتصال مدل‌ها (Inference / Developer).<br>
            ۲. یه پرووایدر جدید از نوع OpenAI Compatible اضافه کن.<br>
            ۳. Base URL و API Key رو وارد کن.<br>
            ۴. اسم مدل رو دقیقاً یکی از مدل‌های لیست «مدل‌ها و تست» بنویس (مثلاً gemini-3.8-flash-low).<br>
            ۵. ذخیره کن و یه پیام آزمایشی بفرست.</p>
            <button data-cfg="generic">📋 کپی آدرس + کلید + مدل</button>
          </details>

          <details><summary><b>zcode</b> — محیط کدنویسی</summary>
            <p>۱. تنظیمات zcode رو باز کن و برو به بخش Providers یا Models.<br>
            ۲. Custom Provider رو انتخاب کن.<br>
            ۳. Base URL و API Key رو پیست کن و مدل پیش‌فرض رو بنویس.<br>
            ۴. ذخیره کن؛ از این به بعد مدل‌های Relay توی zcode قابل استفاده‌ان.</p>
            <button data-cfg="zcode">📋 کپی کانفیگ zcode</button>
          </details>

          <details><summary><b>Cherry Studio</b> — چت دسکتاپ چندمدلی</summary>
            <p>۱. تنظیمات ← Model Providers ← دکمه‌ی Add.<br>
            ۲. نوع رو OpenAI انتخاب کن.<br>
            ۳. توی API Host آدرس Relay و توی API Key کلید رو بذار.<br>
            ۴. از بخش Models مدل دلخواهت رو اضافه کن (اسم دقیق از لیست مدل‌ها).</p>
            <button data-cfg="generic">📋 کپی آدرس + کلید + مدل</button>
          </details>

          <details><summary><b>ChatBox</b> — چت ساده برای ویندوز و موبایل</summary>
            <p>۱. تنظیمات ← Model Provider ← OpenAI API.<br>
            ۲. API Host رو آدرس Relay و API Key رو کلید بذار.<br>
            ۳. اسم مدل رو بنویس و ذخیره کن.</p>
            <button data-cfg="generic">📋 کپی آدرس + کلید + مدل</button>
          </details>

          <details><summary><b>VS Code (افزونه‌هایی مثل Continue و Cline)</b></summary>
            <p>۱. توی کانفیگ افزونه یه مدل جدید از نوع OpenAI اضافه کن.<br>
            ۲. apiBase رو آدرس Relay، apiKey رو کلید و model رو اسم مدل بذار.<br>
            ۳. فایل کانفیگ آماده‌ی JSON رو هم می‌تونی از بالای همین صفحه دانلود کنی.</p>
            <button data-cfg="env">📋 کپی متغیرهای محیطی</button>
          </details>

          <details><summary><b>هر برنامه‌ی دیگه‌ای</b></summary>
            <p>هر برنامه‌ای که گزینه‌ی «Custom OpenAI» یا «OpenAI Compatible» داشته باشه با همین سه مقدار وصل می‌شه: آدرس، کلید، اسم مدل. دکمه‌ی زیر هر سه رو یه‌جا کپی می‌کنه.</p>
            <button data-cfg="generic">📋 کپی هر سه مقدار</button>
            <button data-cfg="curl" class="ghost">📋 دستور تست با curl</button>
          </details>
        </div>
      </section>

      <section class="view hidden" id="view-stats">
        <div class="card">
          <h2>📈 آمار مصرف</h2>
          <p class="dim">این‌جا می‌بینی چقدر از Relay استفاده شده: چند تا درخواست فرستاده شده و چند «توکن» مصرف شده (توکن یعنی تکه‌های کوچیک متن؛ هر جواب هوش مصنوعی چند صد تا چند هزار توکن خرج داره). لیست پایین هم آخرین استفاده‌ها رو نشون می‌ده تا بفهمی کدوم برنامه و کی از Relay استفاده کرده.</p>
          <button id="loadStats">نمایش آمار</button>
          <div id="statsOut"></div>
        </div>
      </section>

      <section class="view hidden" id="view-chat">
        <div class="card">
          <h2>💬 چت (چندمرحله‌ای)</h2>
          <p class="dim">یه چت آزمایشی ساده برای امتحان کردن مدل‌ها. مکالمه رو یادش می‌مونه، پس می‌تونی سؤال پی‌در‌پی بپرسی. وسط مکالمه هم می‌تونی مدل رو از لیست بالا عوض کنی. دکمه‌ی «مکالمه‌ی جدید» همه‌چیز رو پاک می‌کنه و از صفر شروع می‌کنی.</p>
          <p class="dim" style="margin:0 0 6px">💾 مکالمه‌های قبلی (روی هرکدوم کلیک کن تا باز بشه؛ «مکالمه‌ی جدید» قبلی‌ها رو پاک نمی‌کنه):</p>
          <div id="chatList" style="margin-bottom:10px"></div>
          <div class="row">
            <select id="model"></select>
            <span class="dim">سطح تفکر (مدل‌های Gemini Flash):</span>
            <select id="reasoning" title="سطح تفکر (مدل‌های Gemini Flash)">
              <option value="auto">خودکار</option>
              <option value="low">کم</option>
              <option value="medium">متوسط</option>
              <option value="high">زیاد</option>
            </select>
            <span id="reasonNote" class="dim"></span>
            <button id="newChat" class="small ghost">مکالمه‌ی جدید</button>
          </div>
          <div id="chatLog" class="chatlog"></div>
          <div class="row">
            <input id="msg" placeholder="پیامت رو بنویس و Enter بزن...">
            <button id="send" class="small">ارسال</button>
          </div>
        </div>
      </section>
    </main>
  </div>

  <div id="updateBanner" class="banner" style="display:none"></div>
  <footer>
    <span>⚡ ${brand} · Open-source Relay for Antigravity</span>
    <span><span id="verInfo"></span> <button id="checkUpdate" class="ghost small">بررسی به‌روزرسانی</button> <button id="updateBtn" class="ghost small" style="display:none">به‌روزرسانی</button></span>
    <span class="socials">${socials}</span>
  </footer>
</div>

<script>
var $ = function(id){ return document.getElementById(id); };
var NL = String.fromCharCode(10);
var fa = function(n){ return Number(n || 0).toLocaleString("fa-IR"); };
var PASS_KEY = "ag-dash-pass";
var RELAY_KEY_LS = "ag-relay-key";

// theme (applies before unlock too)
(function(){
  var t = localStorage.getItem("ag-theme") || "dark";
  document.documentElement.setAttribute("data-theme", t);
})();
function refreshThemeBtn(){ $("themeBtn").textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙"; }

function dashPass(){ return sessionStorage.getItem(PASS_KEY) || ""; }
function relayKey(){ return ($("key").value || "").trim(); }
function needKey(){
  if (relayKey()) return false;
  alert("اول کلید Relay رو بالای صفحه وارد و ثبت کن.");
  return true;
}

// ---------- navigation ----------
document.querySelectorAll("[data-nav]").forEach(function(b){
  b.onclick = function(){
    document.querySelectorAll("[data-nav]").forEach(function(x){ x.classList.remove("active"); });
    b.classList.add("active");
    document.querySelectorAll(".view").forEach(function(v){ v.classList.add("hidden"); });
    $("view-" + b.getAttribute("data-nav")).classList.remove("hidden");
  };
});
$("themeBtn").onclick = function(){
  var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", cur);
  localStorage.setItem("ag-theme", cur);
  refreshThemeBtn();
};
$("lockBtn").onclick = function(){
  sessionStorage.removeItem(PASS_KEY);
  location.reload();
};
</script>

<script>
// ---------- unlock flow ----------
async function tryUnlock(pass){
  var r = await fetch("/api/status-data", { headers: { "X-Dash-Password": pass } });
  if (r.status === 401) return null;
  return await r.json();
}
async function unlockWith(pass){
  $("lockErr").textContent = "";
  try {
    var data = await tryUnlock(pass);
    if (!data) { $("lockErr").textContent = "پسورد اشتباهه."; return; }
    sessionStorage.setItem(PASS_KEY, pass);
    $("lockOverlay").style.display = "none";
    $("app").classList.remove("hidden");
    $("key").value = localStorage.getItem(RELAY_KEY_LS) || "";
    refreshThemeBtn();
    renderData(data);
    initChats();
  } catch (e) { $("lockErr").textContent = "خطا در اتصال."; }
}
$("unlockBtn").onclick = function(){ unlockWith($("passInput").value); };
$("passInput").addEventListener("keydown", function(e){ if (e.key === "Enter") $("unlockBtn").click(); });

// ---------- version + update check (public, no auth) ----------
// Best-effort only: any failure hides the notice, never shows an error.
var installedCommit = "";
async function loadVersion(){
  try {
    var r = await fetch("/api/version");
    if (!r.ok) return;
    var j = await r.json();
    installedCommit = j.commit || "";
    if (installedCommit) $("verInfo").textContent = "نسخه: " + installedCommit;
  } catch (e) { /* silent */ }
}
function showUpdateNote(text){
  var b = $("updateBanner");
  if (!text) { b.style.display = "none"; b.textContent = ""; return; }
  b.textContent = text;
  b.style.display = "block";
}
$("checkUpdate").onclick = async function(){
  if (!installedCommit || installedCommit === "dev") { showUpdateNote(""); return; }
  showUpdateNote("در حال بررسی...");
  try {
    var r = await fetch("https://api.github.com/repos/eshghastast/ag-relay/commits/master");
    if (!r.ok) { showUpdateNote(""); return; }
    var j = await r.json();
    var latest = (j.sha || "").slice(0, 7);
    if (!latest) { showUpdateNote(""); return; }
    if (latest === installedCommit) {
      $("updateBtn").style.display = "none";
      showUpdateNote("به‌روز ✓");
    } else {
      $("updateBtn").style.display = "inline-block";
      showUpdateNote("نسخه‌ی جدید در ریپو هست (" + latest + ")؛ دکمه‌ی به‌روزرسانی ریپوی متصل به این دیپلوی رو با آخرین master سینک می‌کنه (نیاز به GH_SYNC_REPO و GH_SYNC_TOKEN توی متغیرهای محیطی هاست داره).");
    }
  } catch (e) { showUpdateNote(""); }
};
// ---------- one-click updater (dashboard password required) ----------
// POST /api/update pushes upstream master into this deployment's own repo
// (GH_SYNC_REPO) via the GitHub API; the host auto-deploys on that push
// when the project is git-connected to the same repo. A failed run pushes
// nothing. Local changes in that repo are overwritten — hence the confirm.
$("updateBtn").onclick = async function(){
  if (!dashPass()) {
    alert("اول با پسورد داشبورد آنلاک کن.");
    $("lockOverlay").style.display = "flex";
    return;
  }
  if (!confirm("این کار محتوای ریپوی متصل به این دیپلوی رو با آخرین master جایگزین می‌کنه؛ تغییرهای خودت توی اون ریپو از دست می‌ره. ادامه بدم؟")) return;
  showUpdateNote("در حال به‌روزرسانی...");
  try {
    var r = await fetch("/api/update", { method: "POST", headers: { "x-dash-password": dashPass() } });
    var j = await r.json();
    if (!r.ok) {
      if (j.error && j.error.code === "not_configured") {
        showUpdateNote("آپدیتر تنظیم نشده: توی داشبورد هاست دو متغیر GH_SYNC_REPO (مثلا user/ag-relay) و GH_SYNC_TOKEN (توکن گیت‌هاب با دسترسی repo) رو بذار و یه ریدیپلوی بزن.");
      } else {
        showUpdateNote("خطا: " + (j.error ? j.error.message : r.status));
      }
      return;
    }
    $("updateBtn").style.display = "none";
    showUpdateNote("به‌روز شد: " + j.to + " · " + j.changed + " فایل از " + j.files + " فایل عوض شد. اگه پروژه به گیت وصله، هاست روی پوش جدید خودکار دیپلوی می‌کنه؛ وگرنه از ریپوی به‌روز شده دیپلوی بگیر.");
  } catch (e) { showUpdateNote("خطا در اتصال."); }
};
loadVersion();

// ---------- render quota, catalog, models table ----------
function pctOf(f){ return Math.max(0, Math.min(100, Math.round((f || 0) * 100))); }
function barColor(p){ return p > 50 ? "#4ade80" : p > 20 ? "#facc15" : "#f87171"; }
var ALL_MODELS = [];
function renderData(data){
  var dot = $("healthDot");
  if (data.ok) { dot.className = "ok"; $("healthLine").textContent = "متصل به گوگل · " + new Date(data.at).toLocaleTimeString("fa-IR"); }
  else { dot.className = "bad"; $("healthLine").textContent = "خطا در اتصال به گوگل"; }
  var banners = "", groupsHtml = "", modelOpts = "", tableRows = "";
  ALL_MODELS = [];
  (data.groups || []).forEach(function(g){
    var p = pctOf(g.fraction);
    if ((g.fraction || 1) < 0.2) {
      var rt = g.resetTime ? new Date(g.resetTime).toLocaleString("fa-IR") : "—";
      banners += '<div class="banner">⚠️ سهمیه‌ی ' + g.name + ' رو به اتمامه: فقط ' + fa(p) + '٪ باقی مونده · ریست بعدی: ' + rt + '</div>';
    }
    var rows = g.models.slice().sort(function(a, b){ return a.id < b.id ? -1 : 1; }).map(function(m){
      return '<tr><td><code>' + m.id + '</code></td><td>' + m.displayName + '</td><td>' + (m.fraction === null ? "—" : fa(pctOf(m.fraction)) + "٪") + '</td></tr>';
    }).join("");
    var reset = g.resetTime ? new Date(g.resetTime).toLocaleString("fa-IR") : "—";
    groupsHtml += '<section class="card"><h2>' + g.name + ' <span class="dim">— ' + fa(g.models.length) + ' مدل</span></h2>' +
      '<div class="bar"><div class="fill" style="width:' + p + '%;background:' + barColor(p) + '"></div></div>' +
      '<p class="dim">سهمیه‌ی باقی‌مانده: <b>' + fa(p) + '٪</b> · ریست بعدی: ' + reset + '</p>' +
      '<details><summary>مدل‌های این گروه</summary><table>' + rows + '</table></details></section>';
    g.models.forEach(function(m){
      ALL_MODELS.push(m.id);
      modelOpts += '<option value="' + m.id + '">' + m.id + '</option>';
      tableRows += '<tr><td><code>' + m.id + '</code></td><td>' + m.displayName + '</td>' +
        '<td class="mst" data-mst="' + m.id + '">—</td>' +
        '<td class="minf dim" data-minf="' + m.id + '"></td>' +
        '<td><button class="ghost small" data-test="' + m.id + '">تست</button></td></tr>';
    });
  });
  $("bannerZone").innerHTML = banners;
  $("groupsZone").innerHTML = groupsHtml || '<section class="card">مدلی برنگشت.</section>';
  $("model").innerHTML = modelOpts;
  var cmEl = $("cfgModel");
  if (cmEl) {
    var savedModel = localStorage.getItem("ag-cfg-model") || "";
    cmEl.innerHTML = modelOpts;
    if (ALL_MODELS.indexOf(savedModel) >= 0) cmEl.value = savedModel;
  }
  $("modelsTable").innerHTML = '<table><tr><th>مدل</th><th>نام</th><th>وضعیت</th><th>سرعت/جزئیات</th><th></th></tr>' + tableRows + '</table>';
  document.querySelectorAll("[data-test]").forEach(function(b){
    b.onclick = function(){ testOne(b.getAttribute("data-test")); };
  });
}

// ---------- relay key ----------
$("saveKey").onclick = function(){
  localStorage.setItem(RELAY_KEY_LS, relayKey());
  $("keyMsg").textContent = "ثبت شد ✓";
};

// ---------- chat helpers ----------
async function chatOnce(model, messages){
  var r = await fetch("/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + relayKey() }, body: JSON.stringify({ model: model, messages: messages }) });
  var j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || ("HTTP " + r.status));
  return j;
}

// ---------- reasoning picker (Gemini Flash family only) ----------
// The backend has no separate reasoning parameter: for Gemini Flash the
// thinking level IS the model variant (gemini-3.8-flash-low/medium/high),
// so picking a level just switches the model dropdown. Other models keep
// their own fixed reasoning (e.g. opus-4-6-thinking is thinking by design).
// The send path (chatOnce) is unchanged: it sends the model id as-is.
$("reasoning").onchange = function(){
  var lvl = $("reasoning").value;
  var note = $("reasonNote");
  note.textContent = "";
  if (lvl === "auto") return;
  var m = $("model").value || "";
  var fam = m.match(/^(gemini-3\.8-flash)-(low|medium|high)$/);
  if (fam) { $("model").value = fam[1] + "-" + lvl; }
  else { note.textContent = "برای این مدل سطح reasoning جداگانه نداره (خود مدل thinking هست یا نسخه‌ی ثابت)"; }
};
$("model").onchange = function(){ $("reasonNote").textContent = ""; };

// ---------- per-model + all-model tests ----------
async function testOne(model){
  if (needKey()) return;
  var st = document.querySelector('[data-mst="' + model + '"]');
  var inf = document.querySelector('[data-minf="' + model + '"]');
  if (st) st.textContent = "🔄 در حال تست...";
  var t0 = Date.now();
  try {
    var j = await chatOnce(model, [{ role: "user", content: "What is 2+2? Answer with one word." }]);
    var ms = Date.now() - t0;
    var c = (j.choices[0].message.content || "").trim();
    if (st) st.textContent = (c.indexOf("no longer available") >= 0) ? "🟡 بازنشسته" : "🟢 سالم";
    if (inf) inf.textContent = fa((ms / 1000).toFixed(1)) + "s · " + c.slice(0, 40);
  } catch (e) {
    if (st) st.textContent = "🔴 خطا";
    if (inf) inf.textContent = String(e.message).slice(0, 90);
  }
}
$("testAll").onclick = async function(){
  if (needKey()) return;
  for (var i = 0; i < ALL_MODELS.length; i++) { await testOne(ALL_MODELS[i]); }
};

// ---------- stats ----------
$("loadStats").onclick = async function(){
  if (needKey()) return;
  var out = $("statsOut");
  out.innerHTML = "<p class='dim'>در حال خواندن...</p>";
  try {
    var r = await fetch("/api/stats", { headers: { Authorization: "Bearer " + relayKey() } });
    var j = await r.json();
    if (!j.available) { out.innerHTML = "<p>آمار هنوز در دسترس نیست.</p>"; return; }
    var t = j.totals || {};
    var days = Object.keys(j.days || {}).sort().reverse();
    var today = (j.days && j.days[days[0]]) || { requests: 0, errors: 0, prompt: 0, completion: 0 };
    var h = "<p>مجموع کل: <b>" + fa(t.requests) + "</b> درخواست · <b>" + fa((t.prompt || 0) + (t.completion || 0)) + "</b> توکن · خطا: " + fa(t.errors) + "</p>";
    h += "<p>آخرین روز (" + (days[0] || "—") + "): <b>" + fa(today.requests) + "</b> درخواست · <b>" + fa((today.prompt || 0) + (today.completion || 0)) + "</b> توکن</p>";
    var rec = (j.recent || []).slice(0, 10);
    if (rec.length) h += "<table>" + rec.map(function(e){ return "<tr><td>" + new Date(e.at).toLocaleTimeString("fa-IR") + "</td><td><code>" + e.model + "</code></td><td>" + e.status + "</td><td>" + fa(e.total) + " توکن</td></tr>"; }).join("") + "</table>";
    out.innerHTML = h;
  } catch (e) { out.innerHTML = "<p>خطا در خواندن آمار.</p>"; }
};

// ---------- multi-turn chat (persistent, saved in the browser) ----------
var CHATS_LS = "ag-chats";
var chats = [];
var currentChatId = null;
var chatHistory = [];
function loadChats(){ try { chats = JSON.parse(localStorage.getItem(CHATS_LS) || "[]"); } catch (e) { chats = []; } }
function persistChats(){ try { localStorage.setItem(CHATS_LS, JSON.stringify(chats.slice(0, 30))); } catch (e) {} }
function saveCurrent(){
  if (!currentChatId) return;
  var idx = -1;
  for (var i = 0; i < chats.length; i++) if (chats[i].id === currentChatId) idx = i;
  var title = "مکالمه";
  for (var j = 0; j < chatHistory.length; j++) if (chatHistory[j].role === "user") { title = chatHistory[j].content.slice(0, 40); break; }
  var rec = { id: currentChatId, title: title, at: Date.now(), messages: chatHistory.slice() };
  if (idx >= 0) chats[idx] = rec; else chats.unshift(rec);
  persistChats();
  renderChatList();
}
function renderChatList(){
  var zone = $("chatList");
  if (!zone) return;
  if (!chats.length) { zone.innerHTML = "<span class='dim'>هنوز مکالمه‌ای ذخیره نشده.</span>"; return; }
  zone.innerHTML = "";
  chats.forEach(function(c){
    var row = document.createElement("div");
    row.className = "chatitem" + (c.id === currentChatId ? " cur" : "");
    var t = document.createElement("span");
    t.className = "ctitle";
    t.textContent = c.title;
    t.onclick = function(){ openChat(c.id); };
    var d = document.createElement("span");
    d.className = "dim";
    d.textContent = new Date(c.at).toLocaleDateString("fa-IR");
    var del = document.createElement("button");
    del.className = "ghost small";
    del.textContent = "🗑";
    del.onclick = function(ev){ ev.stopPropagation(); deleteChat(c.id); };
    row.appendChild(t); row.appendChild(d); row.appendChild(del);
    zone.appendChild(row);
  });
}
function openChat(id){
  for (var i = 0; i < chats.length; i++) {
    if (chats[i].id === id) {
      currentChatId = id;
      chatHistory = chats[i].messages.slice();
      $("chatLog").innerHTML = "";
      chatHistory.forEach(function(m){ addBubble(m.content, m.role === "user" ? "u" : "a"); });
      renderChatList();
      return;
    }
  }
}
function deleteChat(id){
  chats = chats.filter(function(c){ return c.id !== id; });
  if (currentChatId === id) { currentChatId = null; chatHistory = []; $("chatLog").innerHTML = ""; }
  persistChats();
  renderChatList();
}
function initChats(){
  loadChats();
  if (chats.length) openChat(chats[0].id); else renderChatList();
}
function addBubble(text, who, meta){
  var log = $("chatLog");
  var d = document.createElement("div");
  d.className = "bubble " + who;
  d.textContent = text;
  if (meta) { var s = document.createElement("span"); s.className = "meta"; s.textContent = meta; d.appendChild(s); }
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
  return d;
}
async function sendChat(){
  if (needKey()) return;
  var inp = $("msg");
  var text = inp.value.trim();
  if (!text) return;
  inp.value = "";
  if (!currentChatId) currentChatId = "c" + Date.now();
  chatHistory.push({ role: "user", content: text });
  addBubble(text, "u");
  saveCurrent();
  var model = $("model").value;
  var wait = addBubble("...", "a");
  var t0 = Date.now();
  try {
    var j = await chatOnce(model, chatHistory);
    var reply = (j.choices[0].message.content || "");
    chatHistory.push({ role: "assistant", content: reply });
    var secs = ((Date.now() - t0) / 1000).toFixed(1);
    var tok = j.usage ? (j.usage.total_tokens || 0) : 0;
    wait.textContent = reply;
    var s = document.createElement("span"); s.className = "meta";
    s.textContent = model + " · " + fa(secs) + " ثانیه" + (tok ? " · " + fa(tok) + " توکن" : "");
    wait.appendChild(s);
    saveCurrent();
  } catch (e) {
    chatHistory.pop();
    wait.textContent = "خطا: " + e.message;
    saveCurrent();
  }
}
$("send").onclick = sendChat;
$("msg").addEventListener("keydown", function(e){ if (e.key === "Enter") sendChat(); });
$("newChat").onclick = function(){
  currentChatId = null;
  chatHistory = [];
  $("chatLog").innerHTML = "";
  renderChatList();
};

// ---------- copy configs ----------
var BASE = location.origin + "/v1";
var Q = String.fromCharCode(34), BS = String.fromCharCode(92);
function cfgModelVal(){ var el = $("cfgModel"); return (el && el.value) || "gemini-3.8-flash-low"; }
function cfgText(kind){
  var k = relayKey() || "YOUR_KEY";
  var mdl = cfgModelVal();
  if (kind === "generic") return ["Base URL: " + BASE, "API Key: " + k, "Model: " + mdl].join(NL);
  if (kind === "curl") return "curl.exe " + BASE + "/chat/completions -H " + Q + "Authorization: Bearer " + k + Q + " -H " + Q + "Content-Type: application/json" + Q + " -d " + Q + "{" + BS + Q + "model" + BS + Q + ":" + BS + Q + mdl + BS + Q + "," + BS + Q + "messages" + BS + Q + ":[{" + BS + Q + "role" + BS + Q + ":" + BS + Q + "user" + BS + Q + "," + BS + Q + "content" + BS + Q + ":" + BS + Q + "سلام" + BS + Q + "}]}" + Q;
  if (kind === "router") return ["Provider: OpenAI Compatible", "Name: agrelay", "Prefix: agrelay", "API Type: Chat Completions", "Base URL: " + BASE, "API Key: " + k].join(NL);
  if (kind === "zcode") return ["Provider: Custom", "Base URL: " + BASE, "API Key: " + k, "Model: " + mdl].join(NL);
  if (kind === "env") return ["OPENAI_BASE_URL=" + BASE, "OPENAI_API_KEY=" + k].join(NL);
  return "";
}
document.querySelectorAll("[data-cfg]").forEach(function(b){
  b.onclick = async function(){
    var txt = cfgText(b.getAttribute("data-cfg"));
    try { await navigator.clipboard.writeText(txt); $("cfgMsg").textContent = "کپی شد ✓"; }
    catch (e) { $("cfgMsg").textContent = txt; }
  };
});


// ---------- config extras: field copy, downloads, connection test ----------
var cmChange = $("cfgModel");
if (cmChange) cmChange.onchange = function(){ localStorage.setItem("ag-cfg-model", cmChange.value); };
document.querySelectorAll("[data-copyfield]").forEach(function(b){
  b.onclick = async function(){
    var f = b.getAttribute("data-copyfield");
    var txt = f === "base" ? BASE : f === "key" ? relayKey() : cfgModelVal();
    if (f === "key" && !txt) { $("cfgMsg").textContent = "اول کلید Relay رو بالای صفحه ثبت کن."; return; }
    try { await navigator.clipboard.writeText(txt); $("cfgMsg").textContent = "کپی شد ✓"; }
    catch (e) { $("cfgMsg").textContent = txt; }
  };
});
function downloadFile(name, text){
  var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
}
var ceBtn = $("copyEndpoint");
if (ceBtn) ceBtn.onclick = async function(){
  try { await navigator.clipboard.writeText(BASE); ceBtn.textContent = "کپی شد ✓"; setTimeout(function(){ ceBtn.textContent = "📋 کپی آدرس"; }, 2000); }
  catch (e) { ceBtn.textContent = BASE; }
};
$("dlEnv").onclick = function(){ downloadFile("ag-relay.env", cfgText("env")); $("cfgMsg").textContent = "فایل ‎.env دانلود شد ✓"; };
$("dlJson").onclick = function(){
  var obj = { name: "ag-relay", baseUrl: BASE, apiKey: relayKey() || "YOUR_KEY", model: cfgModelVal(), models: ALL_MODELS };
  downloadFile("ag-relay-config.json", JSON.stringify(obj, null, 2));
  $("cfgMsg").textContent = "فایل JSON دانلود شد ✓";
};
$("testConn").onclick = async function(){
  var out = $("connMsg");
  if (needKey()) return;
  out.textContent = "در حال تست اتصال...";
  try {
    var r = await fetch(BASE + "/models", { headers: { Authorization: "Bearer " + relayKey() } });
    var j = await r.json();
    if (r.ok && j.data) out.textContent = "✅ اتصال سالمه — کلید درسته و " + fa(j.data.length) + " مدل در دسترسه.";
    else out.textContent = "🔴 اتصال برقرار نشد (HTTP " + r.status + "). کلید رو چک کن.";
  } catch (e) { out.textContent = "🔴 خطا در اتصال: " + e.message; }
};

// ---------- boot ----------
refreshThemeBtn();
if (dashPass()) unlockWith(dashPass());
</script>

</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(html);
}
