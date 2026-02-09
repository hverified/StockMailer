// src/templates/homepage.scripts.js
const js = `
// Utility Functions
const utils = {
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  formatNumber: (num) => Number(num).toLocaleString('en-IN'),
  
  formatDate: (dateStr) => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') {
      return 'Invalid Date';
    }
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  },
  
  getCurrentDate: () => new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }),

  formatDateTime: (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
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

// Custom Alert Functions
const customAlert = {
  show: (options) => {
    const {
      type = 'success',
      title = 'Success',
      message = '',
      details = null
    } = options;

const iconMap = {
  success: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  error: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  info: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12.01" y2="16"></line><line x1="12" y1="8" x2="12" y2="12"></line></svg>'
};

const icon = iconMap[type] || iconMap.info;
const iconClass = type;


    let detailsHtml = '';
    if (details && typeof details === 'object') {
      detailsHtml = \`
        <div class="custom-alert-details">
          \${Object.entries(details).map(([key, value]) => \`
            <div class="custom-alert-detail">
              <span class="custom-alert-detail-label">\${key}</span>
              <span class="custom-alert-detail-value">\${value}</span>
            </div>
          \`).join('')}
        </div>
      \`;
    }

    const alertHtml = \`
      <div class="custom-alert-overlay" onclick="customAlert.hide()">
        <div class="custom-alert" onclick="event.stopPropagation()">
          <div class="custom-alert-icon \${iconClass}">
            \${icon}
          </div>
          <div class="custom-alert-title">\${title}</div>
          <div class="custom-alert-message">\${message}</div>
          \${detailsHtml}
          <button class="custom-alert-button" onclick="customAlert.hide()">
            Got it!
          </button>
        </div>
      </div>
    \`;

    document.body.insertAdjacentHTML('beforeend', alertHtml);
  },

  hide: () => {
    const overlay = document.querySelector('.custom-alert-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    }
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
  }),
  patch: (url, body) => api.fetch(url, {
    method: 'PATCH',
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
    
    const trendIcon = isUp 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>';
    
    return \`
      <div class="card" style="background:\${bg};border:1px solid \${border};">
        <div style="font-size:15px;font-weight:600;color:\${title};margin-bottom:10px;display:flex;align-items:center;gap:8px;">
          <span style="display:inline-flex;color:\${val};">\${trendIcon}</span>
          <span>Nifty \${isUp ? 'Above' : 'Below'} 20 EMA</span>
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
    
    const changeIcon = isUp
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    
    return \`
      <div class="card" style="border:1px dashed #c7c8c8;">
        <div style="font-weight:600;">\${stock.stock_name || 'N/A'}</div>
        <div style="color:#0ea5e9;font-size:12px;">\${stock.symbol || ''}</div>
        <div style="font-size:20px;font-weight:700;margin-top:6px;">
          ₹\${Number(stock.close || 0).toFixed(2)}
        </div>
        <div style="font-size:13px;font-weight:700;color:\${isUp ? '#16a34a' : '#dc2626'};display:flex;align-items:center;gap:4px;margin-top:3px;">
          <span style="display:inline-flex;">\${changeIcon}</span>
          <span>\${isUp ? '+' : ''}\${chg.toFixed(2)}%</span>
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
      <div style="margin-bottom:12px;display:inline-flex;color:#64748b;">\${icon}</div>
      <h3 style="margin:0 0 8px;">\${title}</h3>
      <p style="color:#64748b;">\${message}</p>
    </div>
  \`,

  outcomeReport: (report) => \`
    <div class="report-wrap">
      <div class="report-header">
        <h3>Stocks Report</h3>
        <span>\${utils.formatDate(report.date)}</span>
      </div>
      <div class="report-grid">
        <div class="report-card">
          <div class="report-label">Total Shortlisted</div>
          <div class="report-value">\${report.totalShortlisted}</div>
        </div>
        <div class="report-card">
          <div class="report-label">Triggered</div>
          <div class="report-value">\${report.triggered}</div>
        </div>
        <div class="report-card">
          <div class="report-label">Not Triggered</div>
          <div class="report-value">\${report.notTriggered}</div>
        </div>
        <div class="report-card">
          <div class="report-label">Profit</div>
          <div class="report-value positive">\${report.profits}</div>
        </div>
        <div class="report-card">
          <div class="report-label">Loss</div>
          <div class="report-value negative">\${report.losses}</div>
        </div>
        <div class="report-card">
          <div class="report-label">Open Triggered Trades</div>
          <div class="report-value">\${report.openTriggeredTrades}</div>
        </div>
        <div class="report-card">
          <div class="report-label">Trigger Rate</div>
          <div class="report-value">\${Number(report.triggerRate || 0).toFixed(2)}%</div>
        </div>
        <div class="report-card">
          <div class="report-label">Win Rate</div>
          <div class="report-value">\${Number(report.winRate || 0).toFixed(2)}%</div>
        </div>
        <div class="report-card">
          <div class="report-label">Avg % Change</div>
          <div class="report-value">\${Number(report.avgChange || 0).toFixed(2)}%</div>
        </div>
      </div>
    </div>
  \`,

  aggregateReport: (report) => {
    const summary = report?.summary || {};
    const byDate = Array.isArray(report?.byDate) ? report.byDate : [];

    const rows = byDate.length
      ? byDate.map((day) => \`
        <tr>
          <td>\${utils.formatDate(day.date)}</td>
          <td>\${day.totalShortlisted || 0}</td>
          <td>\${day.triggered || 0}</td>
          <td>\${day.notTriggered || 0}</td>
          <td style="color:#15803d;font-weight:700;">\${day.profits || 0}</td>
          <td style="color:#b91c1c;font-weight:700;">\${day.losses || 0}</td>
        </tr>
      \`).join('')
      : '<tr><td colspan="6" style="text-align:center;color:#64748b;">No report data available yet.</td></tr>';

    return \`
      <div class="report-wrap">
        <div class="report-header">
          <h3>Aggregated Stocks Report</h3>
          <span>Across all scan dates</span>
        </div>

        <div class="report-grid">
          <div class="report-card"><div class="report-label">Total Scans</div><div class="report-value">\${summary.totalScans || 0}</div></div>
          <div class="report-card"><div class="report-label">Total Shortlisted</div><div class="report-value">\${summary.totalShortlisted || 0}</div></div>
          <div class="report-card"><div class="report-label">Triggered</div><div class="report-value">\${summary.triggered || 0}</div></div>
          <div class="report-card"><div class="report-label">Not Triggered</div><div class="report-value">\${summary.notTriggered || 0}</div></div>
          <div class="report-card"><div class="report-label">Profit</div><div class="report-value positive">\${summary.profits || 0}</div></div>
          <div class="report-card"><div class="report-label">Loss</div><div class="report-value negative">\${summary.losses || 0}</div></div>
          <div class="report-card"><div class="report-label">Open Triggered</div><div class="report-value">\${summary.openTriggeredTrades || 0}</div></div>
          <div class="report-card"><div class="report-label">Trigger Rate</div><div class="report-value">\${Number(summary.triggerRate || 0).toFixed(2)}%</div></div>
          <div class="report-card"><div class="report-label">Win Rate</div><div class="report-value">\${Number(summary.winRate || 0).toFixed(2)}%</div></div>
          <div class="report-card"><div class="report-label">Avg % Change</div><div class="report-value">\${Number(summary.avgChange || 0).toFixed(2)}%</div></div>
          <div class="report-card"><div class="report-label">Resolved Trades</div><div class="report-value">\${summary.resolvedTrades || 0}</div></div>
          <div class="report-card"><div class="report-label">Total Volume</div><div class="report-value">\${utils.formatNumber(summary.totalVolume || 0)}</div></div>
        </div>
      </div>

      <div class="report-wrap">
        <div class="report-header">
          <h3>Date-wise Breakdown</h3>
          <span>Latest 30 scan days</span>
        </div>
        <div class="report-table-wrap">
          <table class="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shortlisted</th>
                <th>Triggered</th>
                <th>Not Triggered</th>
                <th>Profit</th>
                <th>Loss</th>
              </tr>
            </thead>
            <tbody>
              \${rows}
            </tbody>
          </table>
        </div>
      </div>
    \`;
  },
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
  
  const statusIcon = isUp
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  
  const uptimeSeconds = parseFloat(data.uptime) || 0;
  const uptimeMinutes = uptimeSeconds / 60;
  const uptimeHours = uptimeMinutes / 60;
  
  let uptimeDisplay = '';
  if (uptimeHours >= 1) {
    uptimeDisplay = \`\${uptimeHours.toFixed(1)} hrs\`;
  } else {
    uptimeDisplay = \`\${uptimeMinutes.toFixed(1)} min\`;
  }
  
  const memoryBytes = parseFloat(data.memory) || 0;
  const memoryMB = memoryBytes / (1024 * 1024);
  const memoryGB = memoryMB / 1024;
  
  let memoryDisplay = '';
  if (memoryGB >= 1) {
    memoryDisplay = \`\${memoryGB.toFixed(2)} GB\`;
  } else {
    memoryDisplay = \`\${memoryMB.toFixed(1)} MB\`;
  }
  
  dom.setContent(\`
    <div class="card health-card">
    
      <div style="font-size:15px;font-weight:600;color:\${title};margin-bottom:10px;display:flex;align-items:center;gap:8px;">
        <span style="display:inline-flex;color:\${val};">\${statusIcon}</span>
        <span>System \${isUp ? 'Operational' : 'Attention Needed'}</span>
      </div>
      <table width="100%">
        <tr>
          <td style="
  background:#f8fafc;
  border:1px dashed #e5e7eb;
  border-radius:12px;
  padding:12px;
  text-align:center;
">

            <div style="font-size:11.5px;color:#6b7280;">Uptime</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              \${uptimeDisplay}
            </div>
          </td>
          <td width="12"></td>
          <td style="
  background:#f8fafc;
  border:1px dashed #e5e7eb;
  border-radius:12px;
  padding:12px;
  text-align:center;
">

            <div style="font-size:11.5px;color:#6b7280;">Memory</div>
            <div style="font-size:16.5px;font-weight:700;color:\${val};">
              \${memoryDisplay}
            </div>
          </td>
        </tr>
      </table>
    </div>
  \`);
}
async function loadMarketScan() {
  dom.setActive('scanBtn');
  dom.showLoader(3);
  await utils.sleep(350);
  
  try {
    // Fetch Nifty data first
    const niftyResponse = await api.get('/nifty-status');
    const scanData = await api.get('/test-scrape');
    
    dom.setContent('');

    // Always show Nifty card
    const nifty = {
      price: niftyResponse.price,
      ema20: niftyResponse.ema20,
      aboveEMA: niftyResponse.aboveEMA
    };
    dom.addContent(components.niftyCard(nifty));

    // Show stocks if available, otherwise show empty state
    if (scanData.stocks && scanData.stocks.length > 0) {
      const stocksHtml = scanData.stocks.map(components.stockCard).join('');
      dom.addContent('<div class="stock-grid">' + stocksHtml + '</div>');
    } else {
      dom.addContent(components.emptyState(
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        'No Stocks Shortlisted',
        'No stocks meet the criteria at this time.'
      ));
    }
  } catch (error) {
    console.error('Error loading market scan:', error);
    dom.setContent(components.emptyState(
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      'Error Loading Data',
      'Failed to fetch market data. Please try again.'
    ));
  }
}


async function loadHistory() {
  dom.setActive('historyBtn');
  dom.showLoader(2);
  await utils.sleep(300);
  
  const data = await api.get('/scan-history');
  dom.setContent('');
  
  if (!data.success || !data.dates || data.dates.length === 0) {
    dom.addContent(components.emptyState(
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      'No History Yet',
      'Run a scan to start building history'
    ));
    return;
  }
  
  const historyHtml = data.dates.map(d => {
    if (!d.date) {
      console.warn('Invalid date in history item:', d);
      return '';
    }
    
    const isUp = d.niftyData?.isAboveEMA;
    
    const trendIcon = isUp
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>';
        
    return \`
      <div class="history-item" onclick="loadHistoryDetail('\${d.date}')">
        <div class="history-header">
          <div class="history-date-row">
            <div class="history-date">
              <span>\${utils.formatDate(d.date)}</span>
            </div>
            <div class="history-stock-count">
              <span>\${d.count} stock\${d.count !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        <div class="history-stats">
          <div class="history-stat">
            <div class="history-stat-label">Status</div>
            <div class="history-stat-value">
              <span class="history-badge \${!isUp ? 'bearish' : ''}" style="display:inline-flex;align-items:center;gap:4px;">
                <span style="display:inline-flex;">\${trendIcon}</span>
                <span>\${isUp ? 'Bullish' : 'Bearish'}</span>
              </span>
            </div>
          </div>
          
          <div class="history-stat">
            <div class="history-stat-label">Nifty</div>
            <div class="history-stat-value">₹\${d.niftyData?.currentPrice?.toFixed(2) || 'N/A'}</div>
          </div>
          
          <div class="history-stat">
            <div class="history-stat-label">20 EMA</div>
            <div class="history-stat-value">₹\${d.niftyData?.ema20?.toFixed(2) || 'N/A'}</div>
          </div>
        </div>
      </div>
    \`;
  }).filter(Boolean).join('');
  
  dom.addContent('<div>' + historyHtml + '</div>');
}

async function loadHistoryDetail(date) {
  if (!date || date === 'null' || date === 'undefined') {
    dom.setContent(components.emptyState(
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      'Invalid Date',
      'The selected date is invalid. Please try again.'
    ));
    return;
  }
  
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

  const stocksHtml = data.stocks.map(s => {
    const chg = parseFloat(s.per_chg) || 0;
    const isUp = chg >= 0;
    const triggeredStatus = ['triggered', 'not_triggered'].includes(s.triggeredStatus) ? s.triggeredStatus : 'unmarked';
    const pnlStatus = ['profit', 'loss'].includes(s.pnlStatus) ? s.pnlStatus : 'unmarked';
    const hasOutcome = triggeredStatus !== 'unmarked' || pnlStatus !== 'unmarked';
    const lastUpdated = utils.formatDateTime(s.outcomeUpdatedAt || s.updatedAt);
    const toneClass =
      pnlStatus === 'profit'
        ? 'tone-profit'
        : pnlStatus === 'loss'
          ? 'tone-loss'
          : triggeredStatus === 'triggered'
            ? 'tone-triggered'
            : triggeredStatus === 'not_triggered'
              ? 'tone-not-triggered'
              : 'tone-unmarked';
    
    const dayHigh = Number(s.dayHigh) || 0;
    const dayLow = Number(s.dayLow) || 0;
    const buyPrice = dayHigh > 0 ? dayHigh * 1.001 : 0;
    const stoploss = buyPrice > 0 ? buyPrice * 0.975 : 0;
    const target = buyPrice > 0 ? buyPrice * 1.04 : 0;
    
    const changeIcon = isUp
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    return \`
      <div class="history-item history-stock-card \${hasOutcome ? 'is-marked' : ''} \${toneClass}" onclick="selectStockCard(this)" data-symbol="\${s.symbol || ''}">
        <div class="history-header">
          <div class="history-date-row" style="margin-bottom:12px;">
            <div class="history-date" style="flex:1;">
              <div style="font-weight:600;font-size:15px;color:#020617;">\${s.stock_name || 'N/A'}</div>
              <div style="color:#1d4ed8;font-size:12px;font-weight:600;margin-top:2px;">\${s.symbol || ''}</div>
              <div class="outcome-summary">
                <span class="status-badge \${triggeredStatus === 'triggered' ? 'triggered' : triggeredStatus === 'not_triggered' ? 'not-triggered' : 'muted'}">
                  \${triggeredStatus === 'triggered' ? 'Entry: Triggered' : triggeredStatus === 'not_triggered' ? 'Entry: Not Triggered' : 'Entry: Pending'}
                </span>
                <span class="status-badge \${pnlStatus === 'profit' ? 'profit' : pnlStatus === 'loss' ? 'loss' : 'muted'}">
                  \${pnlStatus === 'profit' ? 'P/L: Profit' : pnlStatus === 'loss' ? 'P/L: Loss' : 'P/L: Pending'}
                </span>
                <span class="status-saved \${hasOutcome ? 'done' : 'pending'}">\${hasOutcome ? 'Reviewed' : 'Pending'}</span>
              </div>
              \${hasOutcome && lastUpdated ? \`<div class="outcome-updated">Updated: \${lastUpdated}</div>\` : ''}
            </div>
            <div class="stock-price-block">
              <div class="stock-price-value">
₹\${Number(s.close || 0).toFixed(2)}</div>
              <div class="stock-change-line" style="color:\${isUp ? '#16a34a' : '#dc2626'};">
                <span style="display:inline-flex;">\${changeIcon}</span>
                <span>\${isUp ? '+' : ''}\${chg.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="outcome-row">
          <button class="outcome-chip \${triggeredStatus === 'triggered' ? 'active triggered' : ''}"
            onclick="markStockOutcome(event, '\${date}', '\${s.symbol || ''}', 'triggeredStatus', 'triggered')">
            Triggered
          </button>
          <button class="outcome-chip \${triggeredStatus === 'not_triggered' ? 'active not-triggered' : ''}"
            onclick="markStockOutcome(event, '\${date}', '\${s.symbol || ''}', 'triggeredStatus', 'not_triggered')">
            Not Triggered
          </button>
          <button class="outcome-chip \${pnlStatus === 'profit' ? 'active profit' : ''}"
            onclick="markStockOutcome(event, '\${date}', '\${s.symbol || ''}', 'pnlStatus', 'profit')">
            Profit
          </button>
          <button class="outcome-chip \${pnlStatus === 'loss' ? 'active loss' : ''}"
            onclick="markStockOutcome(event, '\${date}', '\${s.symbol || ''}', 'pnlStatus', 'loss')">
            Loss
          </button>
        </div>
        
        <div class="history-stats" style="grid-template-columns:repeat(3, 1fr);">
          <div class="history-stat">
            <div class="history-stat-label">Day High</div>
            <div class="history-stat-value">₹\${dayHigh > 0 ? dayHigh.toFixed(2) : 'N/A'}</div>
          </div>
          
          <div class="history-stat">
            <div class="history-stat-label">Day Low</div>
            <div class="history-stat-value">₹\${dayLow > 0 ? dayLow.toFixed(2) : 'N/A'}</div>
          </div>
          
          <div class="history-stat">
            <div class="history-stat-label">Volume</div>
            <div class="history-stat-value" style="display:flex;align-items:center;justify-content:center;gap:4px;">
              <span>\${s.volume ? utils.formatNumber(s.volume) : '—'}</span>
            </div>
          </div>
        </div>
        
        <div class="history-stats">
          <div class="history-stat">
            <div class="history-stat-label">Buy At</div>
            <div class="history-stat-value" style="display:flex;align-items:center;justify-content:center;gap:4px;">
              <span>₹\${buyPrice > 0 ? buyPrice.toFixed(2) : 'N/A'}</span>
            </div>
          </div>
          
          <div class="history-stat" >
            <div class="history-stat-label">Stoploss</div>
            <div class="history-stat-value" style="display:flex;align-items:center;justify-content:center;gap:4px;">
              <span>₹\${stoploss > 0 ? stoploss.toFixed(2) : 'N/A'}</span>
            </div>
          </div>
          
          <div class="history-stat">
            <div class="history-stat-label">Target</div>
            <div class="history-stat-value" style="display:flex;align-items:center;justify-content:center;gap:4px;">
              <span>₹\${target > 0 ? target.toFixed(2) : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    \`;
  }).join('');
  
  dom.addContent('<div>' + stocksHtml + '</div>');
}

async function loadStocksReport() {
  dom.setActive('reportBtn');
  dom.showLoader(2);
  await utils.sleep(240);

  try {
    const data = await api.get('/stocks-report?limit=30');
    dom.setContent('');

    if (!data.success) {
      dom.addContent(components.emptyState(
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        'Report Unavailable',
        'Unable to load aggregated stocks report.'
      ));
      return;
    }

    dom.addContent(components.aggregateReport(data.report));
  } catch (error) {
    dom.setContent(components.emptyState(
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      'Error Loading Report',
      'Failed to fetch aggregated stocks report. Please try again.'
    ));
  }
}

function selectStockCard(cardElement) {
  document.querySelectorAll('.history-stock-card').forEach((card) => {
    card.classList.remove('is-selected');
  });
  cardElement.classList.add('is-selected');
}

async function markStockOutcome(event, date, symbol, field, value) {
  event.stopPropagation();

  if (!date || !symbol || !field || !value) return;

  const payload = { [field]: value };

  if (field === 'pnlStatus') {
    payload.triggeredStatus = 'triggered';
  }

  if (field === 'triggeredStatus' && value === 'not_triggered') {
    payload.pnlStatus = 'unmarked';
  }

  try {
    const safeSymbol = encodeURIComponent(symbol);
    await api.patch(\`/scan-history/\${date}/stocks/\${safeSymbol}/outcome\`, payload);
    await loadHistoryDetail(date);
  } catch (error) {
    customAlert.show({
      type: 'error',
      title: 'Update Failed',
      message: 'Could not save stock outcome. Please try again.'
    });
  }
}

function isScanAllowedNow() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 16 && hour < 23;
}

async function runManualScan() {
  if (!isScanAllowedNow()) {
    customAlert.show({
      type: 'info',
      title: 'Scan Not Allowed at This Time',
      message:
        'Market scans can only be run after market close, once prices are settled.',
      details: {
        'Allowed Time Window': '4:00 PM – 11:00 PM IST',
      }
    });
    return;
  }

  const btn = dom.get('manualScanBtn');
  btn.disabled = true;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>Running...';
  
  try {
    const data = await api.post('/manual-scan');
    
    if (data.success) {
      customAlert.show({
        type: 'success',
        title: 'Scan Completed Successfully!',
        message: 'Your stock scan has been completed and the results have been saved to the database.',
        details: {
          'Stocks Found': data.stocksScraped,
          'Stocks Saved': data.stocksSaved,
          'Nifty Status': data.niftyData?.isAboveEMA 
            ? '<span style="display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> Above EMA</span>' 
            : '<span style="display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg> Below EMA</span>',
          'Nifty Price': '₹' + data.niftyData?.currentPrice?.toFixed(2)
        }
      });
      
      // Reload history after alert is shown
      setTimeout(() => loadHistory(), 500);
    } else {
      customAlert.show({
        type: 'error',
        title: 'Scan Failed',
        message: data.error || 'An error occurred while running the scan.'
      });
    }
  } catch (error) {
    customAlert.show({
      type: 'error',
      title: 'Error',
      message: error.message || 'An unexpected error occurred.'
    });
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>Run Scan';
  }
}

// Initialize
window.addEventListener('load', () => {
  greeting.set();
  loadHistory();
});
`;

module.exports = { js };
