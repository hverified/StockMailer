import { fmtDate, fmtDateTime, toNum } from "../lib/ui-utils";

function HistorySummaryCard({ d, openHistoryDate }) {
  const count = toNum(d.count);
  return (
    <button type="button" className="card history-item" onClick={() => openHistoryDate(d.date)}>
      <div className="history-top-row">
        <div className="history-date">{fmtDate(d.date)}</div>
        <div className="history-stock-count" title={`${count} stock${count === 1 ? "" : "s"}`}>
          <div className="stock-count-dots">
            {Array.from({ length: Math.min(count, 12) }).map((_, i) => (
              <span key={`${d.date}-dot-${i}`} className="stock-count-dot" />
            ))}
            {count > 12 && <span className="stock-count-extra">+{count - 12}</span>}
          </div>
        </div>
      </div>

      <div className="history-outcome-strip">
        <span className="history-outcome-pill triggered">Trig: {toNum(d.triggeredCount)}</span>
        <span className="history-outcome-pill not-triggered">Not Trig: {toNum(d.notTriggeredCount)}</span>
        <span className="history-outcome-pill profit">Profit: {toNum(d.profitCount)}</span>
        <span className="history-outcome-pill loss">Loss: {toNum(d.lossCount)}</span>
      </div>

      <div className="history-stats history-summary-stats">
        <div className="history-stat">
          <div className="history-stat-label">Nifty</div>
          <div className="history-stat-value">₹{toNum(d.niftyData?.currentPrice).toFixed(2)}</div>
        </div>
        <div className="history-stat">
          <div className="history-stat-label">20 EMA</div>
          <div className="history-stat-value">₹{toNum(d.niftyData?.ema20).toFixed(2)}</div>
        </div>
      </div>
    </button>
  );
}

function HistoryDetailCard({
  historyViewDate,
  stock,
  savingOutcomeKey,
  updateStockOutcome,
}) {
  const chg = toNum(stock.per_chg);
  const isUp = chg >= 0;
  const dayHigh = toNum(stock.dayHigh);
  const dayLow = toNum(stock.dayLow);
  const buyPrice = dayHigh > 0 ? dayHigh * 1.001 : 0;
  const stoploss = buyPrice > 0 ? buyPrice * 0.975 : 0;
  const target = buyPrice > 0 ? buyPrice * 1.04 : 0;
  const triggeredStatus = stock.triggeredStatus || "unmarked";
  const pnlStatus = stock.pnlStatus || "unmarked";
  const symbol = stock.symbol || "";
  const hasOutcome = triggeredStatus !== "unmarked" || pnlStatus !== "unmarked";
  const toneClass =
    pnlStatus === "profit"
      ? "tone-profit"
      : pnlStatus === "loss"
      ? "tone-loss"
      : triggeredStatus === "triggered"
      ? "tone-triggered"
      : triggeredStatus === "not_triggered"
      ? "tone-not-triggered"
      : "tone-unmarked";

  const ts = fmtDateTime(stock.outcomeUpdatedAt || stock.updatedAt);
  const loadingTriggered = savingOutcomeKey === `${historyViewDate}-${symbol}-triggeredStatus`;
  const loadingPnl = savingOutcomeKey === `${historyViewDate}-${symbol}-pnlStatus`;

  return (
    <div className={`history-item history-stock-card ${hasOutcome ? "is-marked" : ""} ${toneClass}`}>
      <div className="history-header">
        <div className="history-date-row history-stock-header">
          <div className="history-date">
            <div className="stock-meta-name">{stock.stock_name || "N/A"}</div>
            <div className="stock-meta-symbol">{symbol || "-"}</div>
            <div className="stock-meta-date">Shortlisted: {fmtDate(stock.scannedDate || stock.shortlisted_date || historyViewDate)}</div>
            <div className="outcome-summary">
              <span className={`status-badge ${triggeredStatus === "triggered" ? "triggered" : triggeredStatus === "not_triggered" ? "not-triggered" : "muted"}`}>
                {triggeredStatus === "triggered" ? "Entry: Triggered" : triggeredStatus === "not_triggered" ? "Entry: Not Triggered" : "Entry: Pending"}
              </span>
              <span className={`status-badge ${pnlStatus === "profit" ? "profit" : pnlStatus === "loss" ? "loss" : "muted"}`}>
                {pnlStatus === "profit" ? "P&L: Profit" : pnlStatus === "loss" ? "P&L: Loss" : "P&L: Pending"}
              </span>
              <span className={`status-saved ${hasOutcome ? "done" : "pending"}`}>{hasOutcome ? "Reviewed" : "Pending"}</span>
            </div>
            {hasOutcome && ts && <div className="outcome-updated">Updated: {ts}</div>}
          </div>
          <div className="stock-price-block">
            <div className="stock-price-value">₹{toNum(stock.close).toFixed(2)}</div>
            <div className="stock-change-line" style={{ color: isUp ? "#15803d" : "#b91c1c" }}>
              <span className="inline-icon">{isUp ? "▲" : "▼"}</span>
              <span>{isUp ? "+" : ""}{chg.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="outcome-controls-grid">
        <div className="control-group">
          <div className="control-title">Entry</div>
          <div className="outcome-row">
            <button
              type="button"
              className={`outcome-chip ${triggeredStatus === "triggered" ? "active triggered" : ""} ${loadingTriggered ? "is-loading" : ""}`}
              disabled={loadingTriggered}
              onClick={() => updateStockOutcome(symbol, "triggeredStatus", "triggered")}
            >
              Triggered
            </button>
            <button
              type="button"
              className={`outcome-chip ${triggeredStatus === "not_triggered" ? "active not-triggered" : ""} ${loadingTriggered ? "is-loading" : ""}`}
              disabled={loadingTriggered}
              onClick={() => updateStockOutcome(symbol, "triggeredStatus", "not_triggered")}
            >
              Not Triggered
            </button>
          </div>
        </div>
        <div className="control-group">
          <div className="control-title">P&L</div>
          <div className="outcome-row">
            <button
              type="button"
              className={`outcome-chip ${pnlStatus === "profit" ? "active profit" : ""} ${loadingPnl ? "is-loading" : ""}`}
              disabled={loadingPnl}
              onClick={() => updateStockOutcome(symbol, "pnlStatus", "profit")}
            >
              Profit
            </button>
            <button
              type="button"
              className={`outcome-chip ${pnlStatus === "loss" ? "active loss" : ""} ${loadingPnl ? "is-loading" : ""}`}
              disabled={loadingPnl}
              onClick={() => updateStockOutcome(symbol, "pnlStatus", "loss")}
            >
              Loss
            </button>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-tile">
          <div className="metric-tile-label">Day High</div>
          <div className="metric-tile-value">₹{dayHigh > 0 ? dayHigh.toFixed(2) : "N/A"}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Day Low</div>
          <div className="metric-tile-value">₹{dayLow > 0 ? dayLow.toFixed(2) : "N/A"}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Volume</div>
          <div className="metric-tile-value">{toNum(stock.volume).toLocaleString("en-IN")}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Buy</div>
          <div className="metric-tile-value">₹{buyPrice ? buyPrice.toFixed(2) : "—"}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">SL</div>
          <div className="metric-tile-value">₹{stoploss ? stoploss.toFixed(2) : "—"}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Target</div>
          <div className="metric-tile-value">₹{target ? target.toFixed(2) : "—"}</div>
        </div>
      </div>
    </div>
  );
}

export default function HistorySection({
  historyViewDate,
  historyData,
  historyDateReport,
  historyDetail,
  savingOutcomeKey,
  openHistoryDate,
  restoreHistorySummary,
  updateStockOutcome,
}) {
  return (
    <section className="grid history-grid history-modern">
      <div className="history-title-row">
        <div>
          <h3>{historyViewDate ? "History Detail" : "Scan History"}</h3>
          <p>
            {historyViewDate
              ? "Review outcomes and mark trade status for shortlisted stocks."
              : "Browse past scan sessions with Nifty context and outcomes."}
          </p>
        </div>
      </div>

      {!historyViewDate && historyData.length === 0 && (
        <div className="card empty-state">
          <h3>No History Yet</h3>
          <p>Run a scan to start building history.</p>
        </div>
      )}

      {!historyViewDate &&
        historyData.map((d) => <HistorySummaryCard key={d.date} d={d} openHistoryDate={openHistoryDate} />)}

      {historyViewDate && (
        <div className="history-detail-wrap">
          <button type="button" className="secondary back-btn" onClick={restoreHistorySummary}>
            Back to History
          </button>
          <div className="history-detail-date">{fmtDate(historyViewDate)}</div>

          {historyDateReport && (
            <div className="history-report-cards">
              <div className="report-card"><div className="report-label">Shortlisted</div><div className="report-value">{toNum(historyDateReport.totalShortlisted)}</div></div>
              <div className="report-card"><div className="report-label">Triggered</div><div className="report-value">{toNum(historyDateReport.triggered)}</div></div>
              <div className="report-card"><div className="report-label">Not Triggered</div><div className="report-value">{toNum(historyDateReport.notTriggered)}</div></div>
              <div className="report-card"><div className="report-label">Profit / Loss</div><div className="report-value">{toNum(historyDateReport.profits)} / {toNum(historyDateReport.losses)}</div></div>
              <div className="report-card"><div className="report-label">Trigger Rate</div><div className="report-value">{toNum(historyDateReport.triggerRate).toFixed(2)}%</div></div>
              <div className="report-card"><div className="report-label">Win Rate</div><div className="report-value">{toNum(historyDateReport.winRate).toFixed(2)}%</div></div>
            </div>
          )}

          {historyDetail?.niftyData && (
            <div className="card nifty-compact">
              <strong>Nifty:</strong> ₹{toNum(historyDetail.niftyData.currentPrice).toFixed(2)} | <strong>EMA20:</strong> ₹{toNum(historyDetail.niftyData.ema20).toFixed(2)}
            </div>
          )}

          <div className="stock-grid history-detail-list">
            {(historyDetail?.stocks || []).map((stock) => (
              <HistoryDetailCard
                key={`${historyViewDate}-${stock.symbol || "unknown"}`}
                historyViewDate={historyViewDate}
                stock={stock}
                savingOutcomeKey={savingOutcomeKey}
                updateStockOutcome={updateStockOutcome}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
