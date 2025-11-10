const helpers = require('../utils/helpers');

function generateEmailHTML(stocks) {
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
        
        .header h1 {
          font-size: 24px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .content { 
          padding: 20px;
        }
        
        .summary {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .summary strong {
          color: #667eea;
        }
        
        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        table { 
          width: 100%;
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
        
        td { 
          padding: 12px 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        tr:hover { 
          background: #f9fafb;
        }
        
        .stock-name {
          font-weight: 500;
          color: #111827;
        }
        
        .symbol {
          font-weight: 600;
          color: #667eea;
        }
        
        .positive { 
          color: #10b981;
          font-weight: 600;
        }
        
        .negative { 
          color: #ef4444;
          font-weight: 600;
        }
        
        .footer { 
          background: #1f2937;
          color: #9ca3af;
          padding: 20px;
          text-align: center;
          font-size: 12px;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        .disclaimer {
          margin-top: 20px;
          padding: 15px;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
          font-size: 13px;
          color: #92400e;
        }
        
        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
          body {
            padding: 10px 0;
          }
          
          .container {
            border-radius: 0;
          }
          
          .header {
            padding: 20px 15px;
          }
          
          .header h1 {
            font-size: 20px;
          }
          
          .content {
            padding: 15px;
          }
          
          table {
            font-size: 12px;
          }
          
          th, td {
            padding: 8px 4px;
          }
          
          .stock-name {
            font-size: 13px;
          }
          
          .hide-mobile {
            display: none;
          }
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
          <div class="summary">
            <strong>Total Stocks Screened:</strong> ${stocks.length}
          </div>
          
          ${stocksTable}
          
          <div class="disclaimer">
            ⚠️ <strong>Disclaimer:</strong> This is an automated report for informational purposes only. Please conduct your own research before making any investment decisions.
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Automated Stock Screening System</strong></p>
          <p>Powered by Chartink & Node.js</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateStocksTable(stocks) {
  if (stocks.length === 0) {
    return '<p style="text-align: center; color: #6b7280; padding: 20px;">No stocks found matching the criteria.</p>';
  }

  const rows = stocks.map(stock => `
    <tr>
      <td class="stock-name">${stock.stock_name}</td>
      <td class="symbol">${stock.symbol}</td>
      <td>₹${stock.close?.toFixed(2) || 'N/A'}</td>
      <td class="${parseFloat(stock.per_chg) >= 0 ? 'positive' : 'negative'}">
        ${stock.per_chg ? `${parseFloat(stock.per_chg) > 0 ? '+' : ''}${parseFloat(stock.per_chg).toFixed(2)}%` : 'N/A'}
      </td>
      <td class="hide-mobile">${stock.volume ? stock.volume.toLocaleString('en-IN') : 'N/A'}</td>
    </tr>
  `).join('');

  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Stock Name</th>
            <th>Symbol</th>
            <th>Close</th>
            <th>Change</th>
            <th class="hide-mobile">Volume</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

module.exports = { generateEmailHTML };