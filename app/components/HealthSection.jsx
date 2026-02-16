import { toNum } from "../lib/ui-utils";

export default function HealthSection({ healthData }) {
  return (
    <section className="grid">
      <div className={`card health-card ${healthData.status === "UP" ? "up" : "down"}`}>
        <div className="health-status-line">
          <span>System {healthData.status === "UP" ? "Operational" : "Attention Needed"}</span>
        </div>
        <table width="100%">
          <tbody>
            <tr>
              <td className="health-stat-cell">
                <div className="health-stat-label">Uptime</div>
                <div className="health-stat-value">{Math.round(toNum(healthData.uptime))} sec</div>
              </td>
              <td width={12} />
              <td className="health-stat-cell">
                <div className="health-stat-label">Memory</div>
                <div className="health-stat-value">{(toNum(healthData.memory) / (1024 * 1024)).toFixed(1)} MB</div>
              </td>
              <td width={12} />
              <td className="health-stat-cell">
                <div className="health-stat-label">Response</div>
                <div className="health-stat-value">{toNum(healthData.responseTime).toFixed(0)} ms</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
