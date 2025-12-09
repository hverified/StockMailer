const helpers = require('../utils/helpers');

function generateMorningEmailHTML(stocks, niftyData) {
  const niftyStatus = generateNiftyStatus(niftyData);
  const stocksCards = generateMorningStocksCards(stocks);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Morning Pre-Market Report</title>
</head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1f2937;">
  <div style="max-width:620px;margin:16px auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 35px rgba(6,182,212,0.15);font-size:15px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0ea5e9,#06b6d4);color:white;padding:20px 24px;text-align:center;">
      <div style="font-size:28px;margin-bottom:4px;">🌅</div>
      <h1 style="margin:0;font-size:21px;font-weight:700;letter-spacing:-0.3px;">Morning Pre-Market Report</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">${helpers.currentDateAndDay()}</p>
    </div>

    <div style="padding:18px 20px;">
      ${niftyStatus}

      <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);padding:11px 16px;border-radius:11px;text-align:center;font-size:14px;font-weight:600;color:#1e40af;border:1px solid #bfdbfe;margin-bottom:18px;">
        <strong>${stocks.length} Stock${stocks.length === 1 ? '' : 's'} Tracked</strong>
        <br><small style="font-size:12px;font-weight:500;color:#3b82f6;">Market Opens at 9:15 AM</small>
      </div>

      ${stocksCards}
    </div>

    <!-- Footer -->
    <div style="background:#0f172a;color:#94a3b8;padding:20px;text-align:center;font-size:12px;line-height:1.5;">
      <p style="margin:0;"><strong>🌅 Pre-Market Screening System</strong></p>
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

function generateMorningStocksCards(stocks) {
  if (!stocks || stocks.length === 0) {
    return `<div style="text-align:center;padding:36px 20px;background:#f0f9ff;border-radius:14px;border:2px dashed #bae6fd;color:#0369a1;">
      <h3 style="margin:0 0 8px;font-size:17px;">No Stocks Today</h3>
    </div>`;
  }

  return stocks.map(s => {
    const todayHigh = Number(s.todayHigh || 0);
    const prevDayHigh = Number(s.prevDayHigh || 0);
    const maxHigh = Math.max(todayHigh, prevDayHigh);
    const isTodayMax = todayHigh >= prevDayHigh;
    
    // Determine which value is max and highlight it
    const todayStyle = isTodayMax && todayHigh > 0
      ? 'background:#dcfce7;color:#166534;border:2px solid #86efac;'
      : 'background:#f8fafc;color:#111827;border:2px solid #e2e8f0;';
    
    const prevStyle = !isTodayMax && prevDayHigh > 0
      ? 'background:#dcfce7;color:#166534;border:2px solid #86efac;'
      : 'background:#f8fafc;color:#111827;border:2px solid #e2e8f0;';

    const chg = parseFloat(s.per_chg) || 0;
    const isUp = chg >= 0;
    const changeColor = isUp ? '#16a34a' : '#dc2626';

    // --- New: Calculations for buy, target, stoploss, qty ---
    const buyPrice = maxHigh > 0 ? maxHigh * 1.001 : 0;
    const targetPrice = buyPrice > 0 ? buyPrice * 1.04 : 0;
    const stoplossPrice = buyPrice > 0 ? buyPrice * 0.975 : 0;
    const quantity = buyPrice > 0 ? Math.floor(20000 / buyPrice) : 0;

    const buyDisplay = buyPrice > 0 ? '₹' + buyPrice.toFixed(2) : '—';
    const targetDisplay = targetPrice > 0 ? '₹' + targetPrice.toFixed(2) : '—';
    const stopDisplay = stoplossPrice > 0 ? '₹' + stoplossPrice.toFixed(2) : '—';
    const qtyDisplay = buyPrice > 0 ? String(quantity) : '—';

    return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;">
      <tr>
        <td style="background:white;border:1px solid #e5e7eb;border-radius:13px;padding:15px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          
          <!-- Name + Symbol -->
          <div style="margin-bottom:10px;">
            <div style="font-size:14.5px;font-weight:600;color:#111827;line-height:1.3;">${s.stock_name || 'N/A'}</div>
            <div style="font-size:12px;color:#0ea5e9;font-weight:600;margin-top:2px;">${s.symbol || ''}</div>
          </div>

          <!-- Current Price + Change -->
          <div style="margin:10px 0;padding:10px;background:#f8fafc;border-radius:10px;">
            <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">Current Price</div>
            <div style="font-size:20px;font-weight:700;color:#111827;line-height:1;">₹${Number(s.close || 0).toFixed(2)}</div>
            <div style="font-size:13px;font-weight:700;color:${changeColor};margin-top:3px;">
              ${isUp ? '⬆' : '⬇'} ${isUp ? '+' : ''}${chg.toFixed(2)}%
            </div>
          </div>

          <!-- Today's High vs Previous Day High -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:12px;">
            <tr>
              <td style="padding:10px;${todayStyle}border-radius:10px;text-align:center;vertical-align:top;">
                <div style="font-size:11px;font-weight:600;opacity:0.8;margin-bottom:4px;">Today's High</div>
                <div style="font-size:16px;font-weight:700;">
                  ${todayHigh > 0 ? '₹' + todayHigh.toFixed(2) : '—'}
                </div>
                ${isTodayMax && todayHigh > 0 ? '<div style="font-size:10px;margin-top:4px;font-weight:600;">✓ MAX</div>' : ''}
              </td>
              <td width="12" style="width:12px;"></td>
              <td style="padding:10px;${prevStyle}border-radius:10px;text-align:center;vertical-align:top;">
                <div style="font-size:11px;font-weight:600;opacity:0.8;margin-bottom:4px;">Prev Day High</div>
                <div style="font-size:16px;font-weight:700;">
                  ${prevDayHigh > 0 ? '₹' + prevDayHigh.toFixed(2) : '—'}
                </div>
                ${!isTodayMax && prevDayHigh > 0 ? '<div style="font-size:10px;margin-top:4px;font-weight:600;">✓ MAX</div>' : ''}
              </td>
            </tr>
          </table>

          <!-- Volume -->
          <div style="margin-top:12px;padding:8px;background:#fef3c7;border-radius:8px;text-align:center;">
            <div style="font-size:11px;color:#92400e;font-weight:600;">Volume</div>
            <div style="font-size:14px;font-weight:700;color:#92400e;margin-top:2px;">
              ${s.volume ? Number(s.volume).toLocaleString('en-IN') : '—'}
            </div>
          </div>

          <!-- NEW: Buy / Target / Stoploss / Qty -->
          <div style="margin-top:12px;padding:10px;background:#ecfeff;border-radius:10px;border:1px solid #bbf7d0;">
            <div style="font-size:12px;color:#0f172a;font-weight:700;margin-bottom:8px;text-align:center;">Suggested Order</div>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:13px;">
              <tr>
                <td style="padding:6px 8px;border-radius:8px;text-align:left;font-weight:600;color:#0f172a;">Buy @</td>
                <td style="padding:6px 8px;border-radius:8px;text-align:right;color:#0f172a;font-weight:700;">${buyDisplay}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;border-radius:8px;text-align:left;font-weight:600;color:#065f46;">Target (×1.04)</td>
                <td style="padding:6px 8px;border-radius:8px;text-align:right;color:#065f46;font-weight:700;">${targetDisplay}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;border-radius:8px;text-align:left;font-weight:600;color:#7f1d1d;">Stoploss (×0.975)</td>
                <td style="padding:6px 8px;border-radius:8px;text-align:right;color:#7f1d1d;font-weight:700;">${stopDisplay}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;border-radius:8px;text-align:left;font-weight:600;color:#0f172a;">Quantity (₹20,000)</td>
                <td style="padding:6px 8px;border-radius:8px;text-align:right;color:#0f172a;font-weight:700;">${qtyDisplay}</td>
              </tr>
            </table>
          </div>

        </td>
      </tr>
    </table>`;
  }).join('');
}

module.exports = { generateMorningEmailHTML };
