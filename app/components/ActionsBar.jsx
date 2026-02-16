import { tabIcon, TABS } from "../lib/ui-utils";

export default function ActionsBar({ tab, setTab, runManualScan, resetHistoryState }) {
  return (
    <section className="actions">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`secondary ${tab === t.id ? "active" : ""}`}
          onClick={() => {
            resetHistoryState();
            setTab(t.id);
          }}
        >
          {tabIcon(t.id)}
          <span>{t.label}</span>
        </button>
      ))}
      <button type="button" className="secondary run-btn" onClick={runManualScan}>
        <svg className="icon" viewBox="0 0 24 24" aria-hidden>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span>Run Scan</span>
      </button>
    </section>
  );
}
