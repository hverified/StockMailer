const helpers = require('../utils/helpers');

function generateEmailHTML(stocks, niftyData) {
  const niftyStatus = generateNiftyStatus(niftyData);
  const stocksTable = generateStocksTable(stocks);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
          padding: 20px 0;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }

        .header h1 { font-size: 24px; margin-bottom: 8px; font-weight: 600; }
        .header p { font-size: 14px; opacity: 0.9; }

        .content { padding: 20px; }

        .nifty-status {
          background: ${niftyData.isAboveEMA ? '#d1fae5' : '#fee2e2'};
          border-left: 4px solid ${niftyData.isAboveEMA ? '#10b981' : '#ef4444'};
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .nifty-status h3 {
          color: ${niftyData.isAboveEMA ? '#065f46' : '#991b1b'};
          font-size: 16px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nifty-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
        }

        .metric { background: white; padding: 10px; border-radius: 4px; }
        .metric-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .metric-value { font-size: 18px; font-weight: 600; color: ${niftyData.isAboveEMA ? '#10b981' : '#ef4444'}; }

        .summary { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .summary strong { color: #667eea; }

        /* TABLE layout (desktop/tablet) */
        .table-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-bottom: 16px;
        }

        table {
          width: 100%;
          min-width: 720px; /* force horizontal scroll on small screens when using table */
          border-collapse: collapse;
          font-size: 14px;
        }

        th {
          background: #667eea;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          white-space: nowrap;
        }

        td { padding: 12px 8px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
        tr:last-child td { border-bottom: none; }
        tr:hover { background: #f9fafb; }

        .stock-name { font-weight: 500; color: #111827; }
        .symbol { font-weight: 600; color: #667eea; }
        .positive { color: #10b981; font-weight: 600; }
        .negative { color: #ef4444; font-weight: 600; }

        /* Stacked card view for mobile (improved to prevent merging) */
        .stacked-list { display: none; margin-bottom: 16px; }
        .stacked-card {
          background: #ffffff;
          border: 1px solid #e6e9ef;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
        }

        /* Use a 2-column grid inside the card; each field is a vertical stack (label above value)
           so label/value pairs never merge horizontally */
        .card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 12px;
          align-items: start;
        }

        .field {
          display: block;
        }

        .label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .val {
          font-weight: 600;
          font-size: 14px;
          display: block;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        /* make sure long numbers and names wrap cleanly */
        .stock-name .val, .symbol .val { white-space: normal; }

        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
        .footer p { margin: 5px 0; }

        .no-stocks-message { text-align: center; padding: 40px 20px; color: #6b7280; }
        .no-stocks-message h3 { color: #ef4444; margin-bottom: 10px; }

        /* Mobile Responsive adjustments */
        @media only screen and (max-width: 600px) {
          body { padding: 10px 0; }
          .container { border-radius: 0; }
          .header { padding: 20px 15px; }
          .header h1 { font-size: 20px; }
          .content { padding: 15px; }
          .nifty-metrics { grid-template-columns: 1fr; }

          /* Hide wide table on small screens and show stacked list instead */
          .table-container { display: none; }
          .stacked-list { display: block; }

          /* smaller typography on very small devices */
          .val { font-size: 13px; }
          .label { font-size: 12px; }

          .hide-mobile { display: none !important; } /* keep existing hide-mobile behavior */
        }

        /* Small print fallback for email clients */
        @media screen and (max-width: 420px) {
          table { min-width: 600px; } /* minor adjustment for very small devices */
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📈 Daily Stock Screening Report</h1>
          <p>Generated on: ${helpers.currentDateTime()}</p>
        </div>

        <div class="content">
          ${niftyStatus}

          <div class="summary">
            <strong>Total Stocks ${niftyData.isAboveEMA ? 'Screened' : 'Available (Filtered)'}:</strong> ${stocks.length}
          </div>

          ${stocksTable}

        </div>

        <div class="footer">
          <p><strong>Automated Stock Screening System</strong></p>
          <p>Powered by Chartink, Yahoo Finance & Node.js</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateNiftyStatus(niftyData) {
  const statusIcon = niftyData.isAboveEMA ? '✅' : '⚠️';
  const statusText = niftyData.isAboveEMA ? 'Above 20 EMA (Bullish)' : 'Below 20 EMA (Bearish)';

  return `
    <div class="nifty-status">
      <h3>${statusIcon} Nifty 50 Status: ${statusText}</h3>
      <div class="nifty-metrics">
        <div class="metric">
          <div class="metric-label">Current Price</div>
          <div class="metric-value">₹${niftyData.currentPrice.toFixed(2)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">20 Day EMA</div>
          <div class="metric-value">₹${niftyData.ema20.toFixed(2)}</div>
        </div>
      </div>
      ${!niftyData.isAboveEMA ? '<p style="margin-top: 10px; font-size: 13px; color: #991b1b;"><strong>Note:</strong> No stocks are shown as Nifty 50 is below its 20 EMA.</p>' : ''}
    </div>
  `;
}

function generateStocksTable(stocks) {
  if (!Array.isArray(stocks) || stocks.length === 0) {
    return `
      <div class="no-stocks-message">
        <h3>📭 No Stocks to Display</h3>
        <p>Stocks are filtered out as Nifty 50 is below its 20-day EMA.</p>
        <p style="margin-top: 10px; font-size: 13px;">The market condition is not favorable for the current screening criteria.</p>
      </div>
    `;
  }

  // Table rows (desktop/tablet)
  const rows = stocks.map(stock => {
    const per = stock.per_chg ? parseFloat(stock.per_chg) : NaN;
    const perDisplay = Number.isFinite(per) ? `${per > 0 ? '+' : ''}${per.toFixed(2)}%` : 'N/A';
    const perClass = Number.isFinite(per) ? (per >= 0 ? 'positive' : 'negative') : '';
    return `
      <tr>
        <td class="stock-name">${stock.stock_name || 'N/A'}</td>
        <td class="symbol">${stock.symbol || 'N/A'}</td>
        <td>₹${stock.close ? Number(stock.close).toFixed(2) : 'N/A'}</td>
        <td>₹${stock.dayHigh ? Number(stock.dayHigh).toFixed(2) : 'N/A'}</td>
        <td class="${perClass}">${perDisplay}</td>
        <td class="hide-mobile">${stock.volume ? Number(stock.volume).toLocaleString('en-IN') : 'N/A'}</td>
      </tr>
    `;
  }).join('');

  // Stacked card view (mobile) — improved block/grid layout to avoid merging
  const cards = stocks.map(stock => {
    const per = stock.per_chg ? parseFloat(stock.per_chg) : NaN;
    const perDisplay = Number.isFinite(per) ? `${per > 0 ? '+' : ''}${per.toFixed(2)}%` : 'N/A';
    const perClass = Number.isFinite(per) ? (per >= 0 ? 'positive' : 'negative') : '';
    return `
      <div class="stacked-card" role="listitem" aria-label="${stock.symbol || stock.stock_name || 'stock'}">
        <div class="card-grid">
          <div class="field">
            <div class="label">Name</div>
            <div class="val stock-name">${stock.stock_name || 'N/A'}</div>
          </div>

          <div class="field">
            <div class="label">Symbol</div>
            <div class="val symbol">${stock.symbol || 'N/A'}</div>
          </div>

          <div class="field">
            <div class="label">Close</div>
            <div class="val">₹${stock.close ? Number(stock.close).toFixed(2) : 'N/A'}</div>
          </div>

          <div class="field">
            <div class="label">Change</div>
            <div class="val ${perClass}">${perDisplay}</div>
          </div>

          <div class="field">
            <div class="label">Day High</div>
            <div class="val">₹${stock.dayHigh ? Number(stock.dayHigh).toFixed(2) : 'N/A'}</div>
          </div>

          <div class="field">
            <div class="label">Volume</div>
            <div class="val">${stock.volume ? Number(stock.volume).toLocaleString('en-IN') : 'N/A'}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!-- wide table (desktop / tablet) -->
    <div class="table-container" role="region" aria-label="stocks table">
      <table>
        <thead>
          <tr>
            <th>Stock Name</th>
            <th>Symbol</th>
            <th>Close</th>
            <th>Day High</th>
            <th>Change</th>
            <th class="hide-mobile">Volume</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <!-- stacked cards (mobile friendly) -->
    <div class="stacked-list" role="list" aria-label="stocks list">
      ${cards}
    </div>
  `;
}

module.exports = { generateEmailHTML };
