const helpers = require('../utils/helpers');

function generateEmailHTML(stocks, niftyData) {
  const niftyStatus = generateNiftyStatus(niftyData);
  const stocksCards = generateStocksCards(stocks);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Daily Stock Report</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1f2937;">
  <div style="max-width:620px;margin:16px auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);font-size:15px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;padding:20px 24px;text-align:center;">
      <h1 style="margin:0;font-size:21px;font-weight:700;letter-spacing:-0.3px;">Daily Stock Report</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">${helpers.currentDateAndDay()}</p>
    </div>

    <div style="padding:18px 20px;">
      ${niftyStatus}

      <div style="background:#f8fafc;padding:11px 16px;border-radius:11px;text-align:center;font-size:14px;font-weight:600;color:#475569;border:1px solid #e2e8f0;margin-bottom:18px;">
        <strong>${stocks.length} Stock${stocks.length === 1 ? '' : 's'} Found</strong>
        ${!niftyData.isAboveEMA ? '<br><small style="color:#991b1b;font-size:12px;">Market Bearish • Screening Paused</small>' : ''}
      </div>

      ${stocksCards}
    </div>

    <!-- Footer -->
    <div style="background:#1e293b;color:#94a3b8;padding:20px;text-align:center;font-size:12px;line-height:1.5;">
      <p style="margin:0;"><strong>Automated Screening System</strong></p>
      <p style="margin:6px 0 0;">Chartink • Yahoo Finance • Node.js</p>
      <div style="margin-top:10px;opacity:0.8;">© ${new Date().getFullYear()} Khalid Siddiqui</div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateNiftyStatus(niftyData) {
  const icon = niftyData.isAboveEMA ? '🟢' : '🔴';
  const bg = niftyData.isAboveEMA 
    ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' 
    : 'linear-gradient(135deg,#fef2f2,#fee2e2)';
  const border = niftyData.isAboveEMA ? '#86efac' : '#fca5a5';
  const titleClr = niftyData.isAboveEMA ? '#166534' : '#991b1b';
  const valClr = niftyData.isAboveEMA ? '#16a34a' : '#dc2626';

  return `
  <div style="background:${bg};border-radius:14px;padding:15px;margin-bottom:18px;border:1px solid ${border};">
    <div style="font-size:15px;font-weight:600;color:${titleClr};margin-bottom:10px;">
      ${icon} Nifty 50 ${niftyData.isAboveEMA ? 'Above' : 'Below'} 20 EMA
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="padding:10px;background:white;border-radius:12px;text-align:center;">
          <div style="font-size:11.5px;color:#6b7280;margin-bottom:3px;">Current</div>
          <div style="font-size:16.5px;font-weight:700;color:${valClr};">₹${niftyData.currentPrice.toFixed(2)}</div>
        </td>
        <td width="12" style="width:12px;"></td>
        <td style="padding:10px;background:white;border-radius:12px;text-align:center;">
          <div style="font-size:11.5px;color:#6b7280;margin-bottom:3px;">20 EMA</div>
          <div style="font-size:16.5px;font-weight:700;color:${valClr};">₹${niftyData.ema20.toFixed(2)}</div>
        </td>
      </tr>
    </table>
  </div>`;
}

function generateStocksCards(stocks) {
  if (!stocks || stocks.length === 0) {
    return `<div style="text-align:center;padding:36px 20px;background:#f8fafc;border-radius:14px;border:2px dashed #cbd5e1;color:#64748b;">
      <h3 style="margin:0 0 8px;font-size:17px;">No Stocks Today</h3>
    </div>`;
  }

  return stocks.map(s => {
    const chg = parseFloat(s.per_chg) || 0;
    const isUp = chg >= 0;
    const changeColor = isUp ? '#16a34a' : '#dc2626';

    return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;">
      <tr>
        <td style="background:white;border:1px dashed #c7c8c8;border-radius:13px;padding:15px;">
          
          <!-- Name + Symbol -->
          <div style="margin-bottom:10px;">
            <div style="font-size:14.5px;font-weight:600;color:#111827;line-height:1.3;">${s.stock_name || 'N/A'}</div>
            <div style="font-size:12px;color:#6366f1;font-weight:600;margin-top:2px;">${s.symbol || ''}</div>
          </div>

          <!-- Price + Change -->
          <div style="margin:10px 0;">
            <div style="font-size:22px;font-weight:700;color:#111827;line-height:1;">₹${Number(s.close || 0).toFixed(2)}</div>
            <div style="font-size:13px;font-weight:700;color:${changeColor};margin-top:3px;">
              ${isUp ? '⬆' : '⬇'} ${isUp ? '+' : ''}${chg.toFixed(2)}%
            </div>
          </div>

          <!-- Day High + Volume (same row) -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-top:11px;border-top:1px dashed #e2e8f0;vertical-align:top;">
                <div style="font-size:11px;color:#6b7280;">Day High</div>
                <div style="font-size:14px;font-weight:700;color:#111827;margin-top:3px;">
                  ₹${Number(s.dayHigh || 0).toFixed(2)}
                </div>
              </td>
              <td style="padding-top:11px;border-top:1px dashed #e2e8f0;text-align:right;vertical-align:top;">
                <div style="font-size:11px;color:#6b7280;">Volume</div>
                <div style="font-size:14px;font-weight:700;color:#111827;margin-top:3px;">
                  ${s.volume ? Number(s.volume).toLocaleString('en-IN') : '—'}
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>`;
  }).join('');
}

module.exports = { generateEmailHTML };