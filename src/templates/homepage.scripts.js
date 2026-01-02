// src/templates/homepage.scripts.js
const js = `
// Utility Functions
const utils = {
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  formatNumber: (num) => Number(num).toLocaleString('en-IN'),
  
  formatDate: (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }),
  
  getCurrentDate: () => new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
};

// DOM Functions
const dom = {
  get: (id) => document.getElementById(id),
  
  setActive: (btnId) => {
    document.querySelectorAll('button.secondary')
      .forEach(b => b.classList.remove('active'));
    dom.get(btnId)?.classList.add('active');
  },
  
  setContent: (html) => {
    dom.get('content').innerHTML = html;
  },
  
  addContent: (html) => {
    dom.get('content').innerHTML += html;
  },
  
  showLoader: (count = 3) => {
    const skeletons = Array(count).fill('<div class="skeleton"></div>').join('');
    dom.setContent(skeletons);
  }
};

// Greeting Functions
const greeting = {
  set: () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: hour >= 5 && hour < 12 ? 'Good morning' : null,
      afternoon: hour >= 12 && hour < 17 ? 'Good afternoon' : null,
      evening: hour >= 17 && hour < 23 ? 'Good evening' : null
    };
    
    const text = greetings.morning || greetings.afternoon || greetings.evening || 'Welcome back';
    dom.get('greeting').innerText = text + ', Khalid';
    dom.get('dateLine').innerText = utils.getCurrentDate();
  }
};

// API Functions
const api = {
  fetch: async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  get: (url) => api.fetch(url),
  post: (url, body) => api.fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
};

// Component Generators
const components = {
  niftyCard: (nifty) => {
    const isUp = nifty.aboveEMA;
    const bg = isUp ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
    const border = isUp ? '#86efac' : '#fca5a5';
    const title = isUp ? '#166534' : '#991b1b';
    const val = isUp ? '#16a34a' : '#dc2626';
    
    return \`
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
    \`;
  },
  
  stockCard: (stock) => {
    const chg = parseFloat(stock.per_chg) || 0;
    const isUp = chg >= 0;
    
    return \`
      <div class="card" style="border:1px dashed #c7c8c8;">
        <div style="font-weight:600;">\${stock.stock_name || 'N/A'}</div>
        <div style="color:#6366f1;font-size:12px;">\${stock.symbol || ''}</div>
        <div style="font-size:20px;font-weight:700;margin-top:6px;">
          ₹\${Number(stock.close || 0).toFixed(2)}
        </div>
        <div style="font-size:13px;font-weight:700;color:\${isUp ? '#16a34a' : '#dc2626'};">
          \${isUp ? '⬆' : '⬇'} \${isUp ? '+' : ''}\${chg.toFixed(2)}%
        </div>
        <div style="font-size:13px;margin-top:6px;">
          Volume: \${stock.volume ? utils.formatNumber(stock.volume) : '—'}
        </div>
      </div>
    \`;
  },
  
  countStrip: (count, warning = '') => \`
    <div class="count-strip">
      \${count} stock\${count === 1 ? '' : 's'} \${warning ? 'matched' : 'found'} today
      \${warning ? \`<br><small style="color:#991b1b;font-size:12px;">\${warning}</small>\` : ''}
    </div>
  \`,
  
  emptyState: (icon, title, message) => \`
    <div class="card" style="text-align:center;padding:40px;">
      <div style="font-size:48px;margin-bottom:12px;">\${icon}</div>
      <h3 style="margin:0 0 8px;">\${title}</h3>
      <p style="color:#6b7280;">\${message}</p>
    </div>
  \`
};

// View Loaders
async function loadHealth() {
  dom.setActive('healthBtn');
  dom.showLoader(1);
  await utils.sleep(300);
  
  const data = await api.get('/health');
  const isUp = data.status === 'UP';
  const bg = isUp ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
  const border = isUp ? '#86efac' : '#fca5a5';
  const title = isUp ? '#166534' : '#991b1b';
  const val = isUp ? '#16a34a' : '#dc2626';
  
  dom.setContent(\`
    <div class="card" style="background:\${bg};border:1px solid \${border};">
      <div style="font-size:15px;font-weight:600;color:\${title};margin-bottom:10px;">
        \${isUp ? '🟢' : '🔴'} System \${isUp ? 'Operational' : 'Attention Needed'}
      </div>
      <table width="100%">
        <tr>
          <td style="background:white;border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:11.5px;color:#6b7280;">Uptime</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              \${(data.uptime/60).toFixed(1)} min
            </div>
          </td>
          <td width="12"></td>
          <td style="background:white;border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:11.5px;color:#6b7280;">Memory</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              \${(data.memory/1024/1024).toFixed(1)} MB
            </div>
          </td>
        </tr>
      </table>
    </div>
  \`);
}

async function loadMarketScan() {
  dom.setActive('scanBtn');
  dom.showLoader(4);
  await utils.sleep(350);
  
  const [nifty, scanData] = await Promise.all([
    api.get('/nifty-status'),
    api.get('/test-scrape')
  ]);
  
  dom.setContent('');
  dom.addContent(components.niftyCard(nifty));
  
  const warning = !nifty.aboveEMA ? 'Market Bearish • Screening Paused' : '';
  dom.addContent(components.countStrip(scanData.count || 0, warning));
  
  const stocksHtml = (scanData.stocks || [])
    .map(components.stockCard)
    .join('');
  
  dom.addContent('<div class="stock-grid">' + stocksHtml + '</div>');
}

async function loadHistory() {
  dom.setActive('historyBtn');
  dom.showLoader(2);
  await utils.sleep(300);
  
  const data = await api.get('/scan-history');
  dom.setContent('');
  
  if (!data.success || data.dates.length === 0) {
    dom.addContent(components.emptyState(
      '📊',
      'No History Yet',
      'Run a scan to start building history'
    ));
    return;
  }
  
  dom.addContent(components.countStrip(data.dates.length, '').replace('found today', \`scan\${data.dates.length === 1 ? '' : 's'}\`).replace('Showing last ', 'Showing last '));
  
  const historyHtml = data.dates.map(d => {
    const isUp = d.niftyData?.isAboveEMA;
    const icon = isUp ? '🟢' : '🔴';
    
    return \`
      <div class="history-item" onclick="loadHistoryDetail('\${d.date}')">
        <div class="history-date">
          \${icon} \${utils.formatDate(d.date)}
        </div>
        <div class="history-meta">
          \${d.count} stocks • 
          Nifty: ₹\${d.niftyData?.currentPrice?.toFixed(2) || 'N/A'} • 
          EMA: ₹\${d.niftyData?.ema20?.toFixed(2) || 'N/A'}
        </div>
      </div>
    \`;
  }).join('');
  
  dom.addContent('<div>' + historyHtml + '</div>');
}

async function loadHistoryDetail(date) {
  dom.showLoader(3);
  await utils.sleep(200);
  
  const data = await api.get(\`/scan-history/\${date}\`);
  dom.setContent('');
  
  if (!data.success) {
    dom.addContent(components.emptyState('❌', 'Error', 'Failed to load data'));
    return;
  }
  
  dom.addContent(\`
    <div style="margin-bottom:16px;">
      <button onclick="loadHistory()" style="padding:8px 16px;border-radius:8px;">← Back to History</button>
    </div>
  \`);
  
  const nifty = { ...data.niftyData, price: data.niftyData?.currentPrice, ema20: data.niftyData?.ema20, aboveEMA: data.niftyData?.isAboveEMA };
  dom.addContent(components.niftyCard(nifty));
  dom.addContent(components.countStrip(data.stocks.length, '').replace('today', ''));
  
  const stocksHtml = data.stocks.map(components.stockCard).join('');
  dom.addContent('<div class="stock-grid">' + stocksHtml + '</div>');
}

async function runManualScan() {
  const btn = dom.get('manualScanBtn');
  btn.disabled = true;
  btn.innerText = '⏳ Running...';
  
  try {
    const data = await api.post('/manual-scan');
    
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

// Initialize
window.addEventListener('load', () => {
  greeting.set();
  loadHistory();
});
`;

module.exports = { js };
