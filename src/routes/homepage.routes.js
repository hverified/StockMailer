// src/routes/homepage.routes.js
const express = require('express');
const ChartinkScraper = require('../services/scraper.service');
const MarketDataService = require('../services/market.service');
const StockDBService = require('../services/stock.db.service');
const mongodb = require('../config/mongodb');
const logger = require('../utils/logger');

const router = express.Router();

const scraper = new ChartinkScraper();
const marketService = new MarketDataService();
const stockDBService = new StockDBService();

// Initialize MongoDB connection
(async () => {
  try {
    await mongodb.connect();
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
  }
})();

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
<link rel="icon" type="image/svg+xml" href="/tradewise.svg">

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

.actions {
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin:28px 0;
}

button,a {
  padding:11px 18px;
  border-radius:999px;
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

button:disabled {
  opacity:0.5;
  cursor:not-allowed;
}

a.docs {
  background:#f8fafc;
  color:#475569;
}

a.docs:hover {
  background:#f1f5f9;
}

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

.history-item {
  background:white;
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:14px;
  margin-bottom:10px;
  cursor:pointer;
  transition:all 0.2s;
}

.history-item:hover {
  border-color:#4f46e5;
  box-shadow:0 4px 12px rgba(79,70,229,0.1);
}

.history-date {
  font-weight:600;
  font-size:15px;
  color:#111827;
}

.history-meta {
  font-size:13px;
  color:#6b7280;
  margin-top:4px;
}
</style>
</head>

<body>
<div class="container">

  <div class="header">
    <h1 id="greeting"></h1>
    <div class="date" id="dateLine"></div>
  </div>

  <div class="actions">
    <a class="docs" href="/api-docs">📘 Documentation</a>
    <button id="healthBtn" class="secondary" onclick="loadHealth()">❤️ Health</button>
    <button id="scanBtn" class="secondary" onclick="loadMarketScan()">🔍 Market Scan</button>
    <button id="historyBtn" class="secondary" onclick="loadHistory()">📊 History</button>
    <button id="manualScanBtn" onclick="runManualScan()">▶️ Run Scan</button>
  </div>

  <div id="content" class="grid"></div>
</div>

<script>
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Welcome back';

  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17 && hour < 23) greeting = 'Good evening';

  document.getElementById('greeting').innerText = greeting + ', Khalid';
  document.getElementById('dateLine').innerText = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

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

async function loadHealth(){
  setActive('healthBtn');
  showLoader(1);
  await sleep(300);

  const d = await (await fetch('/health')).json();
  document.getElementById('content').innerHTML = '';

  const isUp = d.status === 'UP';
  const bg = isUp ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
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

async function loadMarketScan(){
  setActive('scanBtn');
  showLoader(4);
  await sleep(350);

  const nifty = await (await fetch('/nifty-status')).json();
  const scanData = await (await fetch('/test-scrape')).json();

  document.getElementById('content').innerHTML = '';

  const isUp = nifty.aboveEMA;
  const bg = isUp ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
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

async function loadHistory(){
  setActive('historyBtn');
  showLoader(2);
  await sleep(300);

  const data = await (await fetch('/api/scan-history')).json();
  document.getElementById('content').innerHTML = '';

  if (!data.success || data.dates.length === 0) {
    add(\`
      <div class="card" style="text-align:center;padding:40px;">
        <div style="font-size:48px;margin-bottom:12px;">📊</div>
        <h3 style="margin:0 0 8px;">No History Yet</h3>
        <p style="color:#6b7280;">Run a scan to start building history</p>
      </div>
    \`);
    return;
  }

  add(\`
    <div class="count-strip">
      Showing last \${data.dates.length} scan\${data.dates.length === 1 ? '' : 's'}
    </div>
  \`);

  const historyHtml = data.dates.map(d => {
    const isUp = d.niftyData?.isAboveEMA;
    const icon = isUp ? '🟢' : '🔴';
    return \`
      <div class="history-item" onclick="loadHistoryDetail('\${d.date}')">
        <div class="history-date">
          \${icon} \${new Date(d.date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
        <div class="history-meta">
          \${d.count} stocks • 
          Nifty: ₹\${d.niftyData?.currentPrice?.toFixed(2) || 'N/A'} • 
          EMA: ₹\${d.niftyData?.ema20?.toFixed(2) || 'N/A'}
        </div>
      </div>
    \`;
  }).join('');

  add('<div>' + historyHtml + '</div>');
}

async function loadHistoryDetail(date) {
  showLoader(3);
  await sleep(200);

  const data = await (await fetch(\`/api/scan-history/\${date}\`)).json();
  document.getElementById('content').innerHTML = '';

  if (!data.success) {
    add('<div class="card">Error loading data</div>');
    return;
  }

  const nifty = data.niftyData;
  const isUp = nifty?.isAboveEMA;
  const bg = isUp ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
  const border = isUp ? '#86efac' : '#fca5a5';
  const title = isUp ? '#166534' : '#991b1b';
  const val = isUp ? '#16a34a' : '#dc2626';

  add(\`
    <div style="margin-bottom:16px;">
      <button onclick="loadHistory()" style="padding:8px 16px;border-radius:8px;">← Back to History</button>
    </div>
  \`);

  add(\`
    <div class="card" style="background:\${bg};border:1px solid \${border};">
      <div style="font-size:15px;font-weight:600;color:\${title};margin-bottom:10px;">
        \${isUp ? '🟢' : '🔴'} \${date} - Nifty \${isUp ? 'Above' : 'Below'} 20 EMA
      </div>
      <table width="100%">
        <tr>
          <td style="background:white;border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:11.5px;color:#6b7280;">Current</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              ₹\${Number(nifty?.currentPrice || 0).toFixed(2)}
            </div>
          </td>
          <td width="12"></td>
          <td style="background:white;border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:11.5px;color:#6b7280;">20 EMA</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              ₹\${Number(nifty?.ema20 || 0).toFixed(2)}
            </div>
          </td>
        </tr>
      </table>
    </div>
  \`);

  add(\`
    <div class="count-strip">
      \${data.stocks.length} stock\${data.stocks.length === 1 ? '' : 's'} found
    </div>
  \`);

  const cards = data.stocks.map(s => {
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

async function runManualScan() {
  const btn = document.getElementById('manualScanBtn');
  btn.disabled = true;
  btn.innerText = '⏳ Running...';

  try {
    const response = await fetch('/api/manual-scan', { method: 'POST' });
    const data = await response.json();
    
    if (data.success) {
      alert(\`Scan completed! Found \${data.stocksScraped} stocks. Saved to database.\`);
      loadHistory();
    } else {
      alert('Scan failed: ' + data.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerText = '▶️ Run Scan';
  }
}

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

router.get('/api/scan-history', async (req, res) => {
  try {
    const dates = await stockDBService.getAllScanDates(30);
    res.json({ success: true, dates });
  } catch (error) {
    logger.error(`Error fetching scan history: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/api/scan-history/:date', async (req, res) => {
  try {
    const stocks = await stockDBService.getStocksByDate(req.params.date);
    const niftyData = stocks.length > 0 ? stocks[0].niftyData : null;
    
    res.json({ 
      success: true, 
      stocks,
      niftyData,
      date: req.params.date
    });
  } catch (error) {
    logger.error(`Error fetching stocks for date: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/api/manual-scan', async (req, res) => {
  try {
    logger.info('Manual scan triggered from UI');
    
    const niftyData = await marketService.getNifty50Data();
    const stocks = await scraper.scrapeStocks();
    
    let filteredStocks = [];
    if (niftyData.isAboveEMA) {
      filteredStocks = await marketService.enrichStocksWithDayHigh(stocks);
    }
    
    await stockDBService.saveStocks(filteredStocks, niftyData);
    
    res.json({
      success: true,
      stocksScraped: stocks.length,
      stocksSaved: filteredStocks.length,
      niftyData
    });
  } catch (error) {
    logger.error(`Manual scan failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;