import { toNum } from "../lib/ui-utils";

export default function MarketScanSection({ scanData }) {
  return (
    <section className="market-scan-layout">
      <div className="market-scan-summary">
        <div className={`card nifty-card ${scanData.nifty?.aboveEMA ? "nifty-bullish" : "nifty-bearish"}`}>
          <div className="nifty-status-line">
            <span>Nifty {scanData.nifty?.aboveEMA ? "Above" : "Below"} 20 EMA</span>
          </div>
          <table>
            <tbody>
              <tr>
                <td className="nifty-stat-cell">
                  <div className="nifty-stat-label">Current</div>
                  <div className="nifty-stat-value">₹{toNum(scanData.nifty?.price).toFixed(2)}</div>
                </td>
                <td width={12} />
                <td className="nifty-stat-cell">
                  <div className="nifty-stat-label">20 EMA</div>
                  <div className="nifty-stat-value">₹{toNum(scanData.nifty?.ema20).toFixed(2)}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="market-scan-panel">
        <div className="market-scan-head">
          <h3>Shortlisted Stocks</h3>
          <span>{scanData.stocks.length}</span>
        </div>
        {scanData.stocks.length === 0 ? (
          <div className="card empty-state">
            <h3>No Stocks Shortlisted</h3>
            <p>No stocks meet the criteria at this time.</p>
          </div>
        ) : (
          <div className="stock-grid">
            {scanData.stocks.map((s, idx) => {
              const chg = toNum(s?.per_chg);
              const symbol = s?.symbol || `stock-${idx}`;
              return (
                <div key={symbol} className="card market-stock-card">
                  <div className="market-stock-name">{s?.stock_name || "N/A"}</div>
                  <div className="market-stock-symbol">{s?.symbol || "-"}</div>
                  <div className="market-stock-price">₹{toNum(s?.close).toFixed(2)}</div>
                  <div className="market-stock-change" style={{ color: chg >= 0 ? "#15803d" : "#b91c1c" }}>
                    <span className="inline-icon">{chg >= 0 ? "▲" : "▼"}</span>
                    {chg >= 0 ? "+" : ""}
                    {chg.toFixed(2)}%
                  </div>
                  <div className="market-stock-volume">Volume: {toNum(s?.volume).toLocaleString("en-IN")}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
