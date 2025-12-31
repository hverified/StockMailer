const express = require('express');
const ChartinkScraper = require('../services/scraper.service');
const MarketDataService = require('../services/market.service');

const router = express.Router();

const scraper = new ChartinkScraper();
const marketService = new MarketDataService();

/* =========================
   HOME PAGE
========================= */
router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Tradewise</title>

<style>
:root {
  --bg:#f9fafb;
  --card:#ffffff;
  --text:#111827;
  --muted:#6b7280;
  --accent:#4f46e5;
  --active:#eef2ff;
  --border:#e5e7eb;
}

body {
  margin:0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
  background:var(--bg);
  color:var(--text);
}

.container {
  max-width:1200px;
  margin:auto;
  padding:36px 32px;
}

/* -------- Header -------- */
.header {
  display:flex;
  flex-direction:column;
  gap:4px;
}

.header h1 {
  font-size:26px;
  font-weight:600;
  letter-spacing:-0.3px;
}

.header .date {
  font-size:14px;
  color:var(--muted);
}

/* -------- Actions -------- */
.actions {
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin:28px 0;
}

button,a {
  padding:11px 18px;
  border-radius:999px; /* pill */
  font-weight:600;
  font-size:14px;
  border:1px solid var(--border);
  cursor:pointer;
  text-decoration:none;
  background:white;
  color:var(--text);
}

button.secondary.active {
  background:var(--active);
  border-color:var(--accent);
  color:var(--accent);
}

/* Docs link (secondary, not primary CTA) */
a.docs {
  background:#f8fafc;
  color:#475569;
}

a.docs:hover {
  background:#f1f5f9;
}

/* -------- Layout -------- */
.grid {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:18px;
}

.card {
  background:var(--card);
  border-radius:16px;
  padding:18px;
  box-shadow:0 12px 30px rgba(0,0,0,.12);
  animation:fadeUp .25s ease forwards;
}

@keyframes fadeUp {
  from {opacity:0; transform:translateY(6px);}
  to {opacity:1; transform:none;}
}

/* Loader */
.skeleton {
  height:130px;
  border-radius:16px;
  background:linear-gradient(90deg,#e5e7eb,#f1f5f9,#e5e7eb);
  background-size:200% 100%;
  animation:shimmer 1.2s infinite;
}

@keyframes shimmer {
  to {background-position:-200% 0;}
}

.stock-grid {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:14px;
}

.count-strip {
  background:#f8fafc;
  border:1px solid var(--border);
  border-radius:12px;
  padding:10px 14px;
  font-size:14px;
  font-weight:600;
  color:#475569;
}
</style>
</head>

<body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <h1 id="greeting"></h1>
    <div class="date" id="dateLine"></div>
  </div>

  <!-- Actions -->
  <div class="actions">
    <a class="docs" href="/api-docs">📘 Documentation</a>
    <button id="healthBtn" class="secondary" onclick="loadHealth()">❤️ Health</button>
    <button id="scanBtn" class="secondary" onclick="loadMarketScan()">🔍 Market Scan</button>
  </div>

  <div id="content" class="grid"></div>
</div>

<script>
/* -------------------------
   Greeting + Date
------------------------- */
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Welcome back';

  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17 && hour < 23) greeting = 'Good evening';

  document.getElementById('greeting').innerText =
    greeting + ', Khalid';

  document.getElementById('dateLine').innerText =
    new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
}

/* -------------------------
   Helpers
------------------------- */
function setActive(btnId){
  document.querySelectorAll('button.secondary')
    .forEach(b => b.classList.remove('active'));
  document.getElementById(btnId).classList.add('active');
}

function showLoader(count=3){
  const c = document.getElementById('content');
  c.innerHTML = '';
  for(let i=0;i<count;i++){
    c.innerHTML += '<div class="skeleton"></div>';
  }
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function add(html){
  document.getElementById('content').innerHTML += html;
}

/* =========================
   HEALTH
========================= */
async function loadHealth(){
  setActive('healthBtn');
  showLoader(1);
  await sleep(300);

  const d = await (await fetch('/health')).json();
  document.getElementById('content').innerHTML = '';

  const isUp = d.status === 'UP';
  const bg = isUp
    ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)'
    : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
  const border = isUp ? '#86efac' : '#fca5a5';
  const title = isUp ? '#166534' : '#991b1b';
  const val = isUp ? '#16a34a' : '#dc2626';

  add(\`
    <div class="card" style="background:\${bg};border:1px solid \${border};">
      <div style="font-size:15px;font-weight:600;color:\${title};margin-bottom:10px;">
        \${isUp ? '🟢' : '🔴'} System \${isUp ? 'Operational' : 'Attention Needed'}
      </div>
      <table width="100%">
        <tr>
          <td style="background:white;border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:11.5px;color:#6b7280;">Uptime</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              \${(d.uptime/60).toFixed(1)} min
            </div>
          </td>
          <td width="12"></td>
          <td style="background:white;border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:11.5px;color:#6b7280;">Memory</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              \${(d.memory/1024/1024).toFixed(1)} MB
            </div>
          </td>
        </tr>
      </table>
    </div>
  \`);
}

/* =========================
   MARKET SCAN (DEFAULT)
========================= */
async function loadMarketScan(){
  setActive('scanBtn');
  showLoader(4);
  await sleep(350);

  const nifty = await (await fetch('/nifty-status')).json();
  const scanData = await (await fetch('/test-scrape')).json();

  document.getElementById('content').innerHTML = '';

  const isUp = nifty.aboveEMA;
  const bg = isUp
    ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)'
    : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
  const border = isUp ? '#86efac' : '#fca5a5';
  const title = isUp ? '#166534' : '#991b1b';
  const val = isUp ? '#16a34a' : '#dc2626';

  add(\`
    <div class="card" style="background:\${bg};border:1px solid \${border};">
      <div style="font-size:15px;font-weight:600;color:\${title};margin-bottom:10px;">
        \${isUp ? '🟢' : '🔴'} Nifty \${isUp ? 'Above' : 'Below'} 20 EMA
      </div>
      <table width="100%">
        <tr>
          <td style="background:white;border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:11.5px;color:#6b7280;">Current</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              ₹\${Number(nifty.price).toFixed(2)}
            </div>
          </td>
          <td width="12"></td>
          <td style="background:white;border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:11.5px;color:#6b7280;">20 EMA</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              ₹\${Number(nifty.ema20).toFixed(2)}
            </div>
          </td>
        </tr>
      </table>
    </div>
  \`);

  const count = scanData.count || 0;
  add(\`
    <div class="count-strip">
      \${count} stock\${count === 1 ? '' : 's'} matched today
    </div>
  \`);

  const cards = (scanData.stocks || []).map(s => {
    const chg = parseFloat(s.per_chg) || 0;
    const up = chg >= 0;
    return \`
      <div class="card" style="border:1px dashed #c7c8c8;">
        <div style="font-weight:600;">\${s.stock_name || 'N/A'}</div>
        <div style="color:#6366f1;font-size:12px;">\${s.symbol || ''}</div>
        <div style="font-size:20px;font-weight:700;margin-top:6px;">
          ₹\${Number(s.close || 0).toFixed(2)}
        </div>
        <div style="font-size:13px;font-weight:700;color:\${up ? '#16a34a' : '#dc2626'};">
          \${up ? '⬆' : '⬇'} \${up ? '+' : ''}\${chg.toFixed(2)}%
        </div>
        <div style="font-size:13px;margin-top:6px;">
          Volume: \${s.volume ? Number(s.volume).toLocaleString('en-IN') : '—'}
        </div>
      </div>
    \`;
  }).join('');

  add('<div class="stock-grid">' + cards + '</div>');
}

/* -------------------------
   DEFAULT LOAD
------------------------- */
window.addEventListener('load', () => {
  setGreeting();
  loadMarketScan();
});
</script>
</body>
</html>`);
});

/* =========================
   APIs
========================= */
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    uptime: process.uptime(),
    memory: process.memoryUsage().rss
  });
});

router.get('/test-scrape', async (req, res) => {
  const stocks = await scraper.scrapeStocks();
  res.json({
    count: stocks.length,
    stocks: stocks.slice(0, 25)
  });
});

router.get('/nifty-status', async (req, res) => {
  const n = await marketService.getNifty50Data();
  res.json({
    price: n.currentPrice,
    ema20: n.ema20,
    aboveEMA: n.isAboveEMA
  });
});

module.exports = router;
