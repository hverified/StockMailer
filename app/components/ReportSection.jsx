import { fmtDateNoWeekday, toNum } from "../lib/ui-utils";

export default function ReportSection({ reportSummary, reportByDate }) {
  return (
    <section className="report-wrap">
      <div className="report-grid">
        <div className="report-card"><div className="report-label">Total Scans</div><div className="report-value">{toNum(reportSummary.totalScans)}</div></div>
        <div className="report-card"><div className="report-label">Total Shortlisted</div><div className="report-value">{toNum(reportSummary.totalShortlisted)}</div></div>
        <div className="report-card"><div className="report-label">Triggered</div><div className="report-value">{toNum(reportSummary.triggered)}</div></div>
        <div className="report-card"><div className="report-label">Not Triggered</div><div className="report-value">{toNum(reportSummary.notTriggered)}</div></div>
        <div className="report-card"><div className="report-label">Profit / Loss</div><div className="report-value">{toNum(reportSummary.profits)} / {toNum(reportSummary.losses)}</div></div>
        <div className="report-card"><div className="report-label">Trigger Rate</div><div className="report-value">{toNum(reportSummary.triggerRate).toFixed(2)}%</div></div>
        <div className="report-card"><div className="report-label">Win Rate</div><div className="report-value">{toNum(reportSummary.winRate).toFixed(2)}%</div></div>
      </div>

      <div className="card report-table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Scanned</th>
              <th>Trig</th>
              <th>Not Trig</th>
              <th>Gain</th>
              <th>Loss</th>
            </tr>
          </thead>
          <tbody>
            {reportByDate.length === 0 && (
              <tr>
                <td colSpan={6} className="report-empty-cell">No report data available yet.</td>
              </tr>
            )}
            {reportByDate.map((r) => (
              <tr key={r.date}>
                <td>{fmtDateNoWeekday(r.date)}</td>
                <td>{toNum(r.totalShortlisted)}</td>
                <td>{toNum(r.triggered)}</td>
                <td>{toNum(r.notTriggered)}</td>
                <td>{toNum(r.profits)}</td>
                <td>{toNum(r.losses)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
