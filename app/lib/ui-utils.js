export const TABS = [
  { id: "history", label: "History" },
  { id: "scan", label: "Market Scan" },
  { id: "health", label: "Health" },
  { id: "report", label: "Stocks Report" },
];

export function toNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateNoWeekday(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function tabIcon(id) {
  if (id === "history") {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden>
        <path d="M3 4h18v4H3z" />
        <path d="M3 12h18v8H3z" />
      </svg>
    );
  }
  if (id === "scan") {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    );
  }
  if (id === "health") {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden>
        <path d="M3 12h4l2-5 4 10 2-5h6" />
      </svg>
    );
  }
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden>
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h6" />
    </svg>
  );
}
