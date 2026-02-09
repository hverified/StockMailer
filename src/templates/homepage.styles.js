// src/templates/homepage.styles.js
const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&display=swap');

:root {
  --bg:#f3f5f8;
  --surface:#ffffff;
  --surface-soft:#f8fafc;
  --surface-blue:#f7fbff;
  --surface-mint:#f7fdfb;
  --text:#0f172a;
  --muted:#5f6f86;
  --accent:#1d4ed8;
  --accent-soft:#dbeafe;
  --success:#166534;
  --danger:#991b1b;
  --border:#d9e1ec;
  --border-strong:#c6d2e3;
  --shadow-sm:0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md:0 10px 24px rgba(15, 23, 42, 0.08);
}

body {
  margin:0;
  font-family:'Manrope','Segoe UI',Arial,sans-serif;
  background:
    radial-gradient(circle at 10% 0%, rgba(59, 130, 246, 0.06), transparent 34%),
    radial-gradient(circle at 90% 20%, rgba(16, 185, 129, 0.04), transparent 30%),
    var(--bg);
  color:var(--text);
  min-height:100vh;
  letter-spacing:-0.01em;
  line-height:1.45;
}

.container {
  max-width:1140px;
  margin:auto;
  padding:40px 32px;
}

.header {
  display:flex;
  flex-direction:column;
  gap:6px;
  margin-bottom:8px;
}

.header h1 {
  font-size:32px;
  font-weight:700;
  letter-spacing:-0.04em;
  margin:0;
  color:#0b1b33;
}

.header .date {
  font-size:13px;
  font-weight:600;
  color:var(--muted);
  letter-spacing:0.01em;
  display:inline-flex;
  align-items:center;
  gap:8px;
}

.header .date::before {
  content:'';
  width:22px;
  height:2px;
  border-radius:999px;
  background:linear-gradient(90deg, #60a5fa, #34d399);
}

.actions {
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:stretch;
  margin:26px 0;
  padding:10px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(247, 251, 255, 0.82));
  border:1px solid var(--border);
  border-radius:14px;
  box-shadow:var(--shadow-sm);
  backdrop-filter:blur(8px);
}

button,a {
  padding:10px 14px;
  border-radius:10px;
  font-weight:600;
  font-size:13px;
  border:1px solid var(--border);
  cursor:pointer;
  text-decoration:none;
  background:var(--surface-soft);
  color:#334155;
  transition:all 0.2s ease;
  box-shadow:none;
}

.actions > button {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  line-height:1.1;
  flex:1 1 180px;
  min-height:42px;
}

.actions > button span {
  white-space:nowrap;
}

.icon {
  width:16px;
  height:16px;
  display:block;
  flex-shrink:0;
  fill:none;
  stroke:currentColor;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round;
  vector-effect:non-scaling-stroke;
}


button:hover,a:hover {
  border-color:var(--border-strong);
  background:#f1f5f9;
  transform:none;
  box-shadow:var(--shadow-sm);
}

button.secondary.active {
  background:var(--surface);
  color:#0f172a;
  border-color:#bfdbfe;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    inset 0 -2px 0 var(--accent);
}

button.secondary:hover {
  background:#f8fafc;
  border-color:#dbe3f0;
  box-shadow:var(--shadow-sm);
}
button.secondary {
  position:relative;
  overflow:hidden;
}

button.secondary::after {
  content:'';
  position:absolute;
  left:50%;
  bottom:0;
  width:0;
  height:2px;
  background:var(--accent);
  transition:all 0.3s ease;
  transform:translateX(-50%);
}
button.secondary.active::after {
  width:100%;
}

button:disabled {
  opacity:0.5;
  cursor:not-allowed;
  transform:none;
}

button:focus-visible,
a:focus-visible {
  outline:2px solid #93c5fd;
  outline-offset:2px;
}

.inline-icon {
  display:inline-flex;
}

.inline-icon-run {
  vertical-align:middle;
  margin-right:6px;
}

.inline-icon-spin {
  animation:spin 1s linear infinite;
}

@keyframes spin {
  from {transform:rotate(0deg);}
  to {transform:rotate(360deg);}
}

a.docs {
  background:#f8fafc;
  color:#475569;
}

a.docs:hover {
  background:#f1f5f9;
}

.grid {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:16px;
}

.card {
  background:var(--surface);
  border-radius:14px;
  border:1px solid var(--border);
  padding:18px 16px;
  box-shadow:
    var(--shadow-sm),
    var(--shadow-md);
  animation:fadeUp .25s ease forwards;
}

.card:hover {
  border-color:#cfd9e8;
}


@keyframes fadeUp {
  from {opacity:0; transform:translateY(6px);}
  to {opacity:1; transform:none;}
}


.skeleton {
  height:128px;
  border-radius:14px;
  background:linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 37%,
    #e2e8f0 63%
  );
  background-size:400% 100%;
  animation:skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position:100% 0;
  }
  100% {
    background-position:-100% 0;
  }
}


.stock-grid {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:14px;
}

.market-stock-card {
  border:1px dashed #c7c8c8;
  background:linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.market-stock-name {
  font-weight:600;
}

.market-stock-symbol {
  color:#0ea5e9;
  font-size:12px;
}

.market-stock-price {
  font-size:20px;
  font-weight:700;
  margin-top:6px;
}

.market-stock-change {
  font-size:13px;
  font-weight:700;
  display:flex;
  align-items:center;
  gap:4px;
  margin-top:3px;
}

.market-stock-volume {
  font-size:13px;
  margin-top:6px;
}

.history-item {
  background:linear-gradient(180deg, var(--surface) 0%, var(--surface-blue) 100%);
  border-radius:14px;
  padding:18px;
  margin-bottom:16px;
  cursor:pointer;
  transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border:1px solid var(--border);
  box-shadow:var(--shadow-sm);
  position:relative;
  overflow:hidden;
}

.history-item::before {
  content:'';
  position:absolute;
  top:0;
  left:0;
  right:0;
  height:2px;
  background:linear-gradient(90deg, #3b82f6, #1d4ed8);
  transform:scaleX(0);
  transform-origin:left;
  transition:transform 0.3s ease;
}

.history-item:hover {
  transform:translateY(-1px);
  border-color:#c9d6e6;
  box-shadow:
    0 6px 12px rgba(15, 23, 42, 0.08),
    0 16px 24px rgba(15, 23, 42, 0.08);
}

.history-item:hover::before {
  transform:scaleX(1);
}

.history-header {
  margin-bottom:12px;
}

.history-date-row {
  display:flex;
  justify-content:space-between;
  align-items:center;
  width:100%;
}

.history-date {
  font-weight:700;
  font-size:16px;
  color:#0f172a;
  display:flex;
  align-items:center;
  gap:8px;
}

.history-badge {
  display:inline-flex;
  align-items:center;
  gap:4px;
  padding:4px 10px;
  border-radius:999px;
  font-size:12px;
  font-weight:600;
  background:#f0fdf4;
  color:var(--success);
  border:1px solid #bbf7d0;
}

.history-badge.bearish {
  background:#fef2f2;
  color:var(--danger);
  border-color:#fecaca;
}

.history-stats {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:12px;
  margin-top:16px;
  padding-top:16px;
  border-top:1px dashed #e5e7eb;
}

.history-stat {
  text-align:center;
  padding:8px;
  background:linear-gradient(180deg, #f8fafc 0%, #f3f7fc 100%);
  border:1px solid #e2e8f0;
  border-radius:10px;
  transition:all 0.2s;
}

.history-stat:hover {
  background:#f1f5f9;
  transform:none;
}

.history-stat-label {
  font-size:11px;
  color:#64748b;
  font-weight:600;
  text-transform:uppercase;
  letter-spacing:0.5px;
  margin-bottom:4px;
}

.history-stat-value {
  font-size:15px;
  font-weight:700;
  color:#0f172a;
}

.history-stock-count {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:auto;
  padding:0;
  background:transparent;
  border:none;
}

.stock-count-dots {
  display:inline-flex;
  align-items:center;
  gap:5px;
}

.stock-count-dot {
  width:12px;
  height:12px;
  border-radius:999px;
  background:linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
  box-shadow:0 1px 3px rgba(37, 99, 235, 0.28);
}

.stock-count-extra {
  margin-left:3px;
  font-size:11px;
  font-weight:700;
  color:#1e3a8a;
}

.report-wrap {
  background:linear-gradient(180deg, var(--surface) 0%, var(--surface-blue) 100%);
  border:1px solid var(--border);
  border-radius:14px;
  padding:16px;
  margin-bottom:16px;
  box-shadow:var(--shadow-sm);
}

.report-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:12px;
}

.report-header h3 {
  margin:0;
  font-size:16px;
  font-weight:700;
}

.report-header span {
  font-size:12px;
  color:var(--muted);
  font-weight:600;
}

.report-grid {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(145px,1fr));
  gap:10px;
}

.report-card {
  border:1px solid #e2e8f0;
  background:linear-gradient(180deg, #f8fafc 0%, #f1f5fb 100%);
  border-radius:10px;
  padding:10px;
}

.report-label {
  color:var(--muted);
  font-size:11px;
  font-weight:600;
  text-transform:uppercase;
  letter-spacing:0.04em;
  margin-bottom:6px;
}

.report-value {
  font-size:19px;
  font-weight:700;
  color:var(--text);
}

.report-value.positive {
  color:#15803d;
}

.report-value.negative {
  color:#b91c1c;
}

.report-table-wrap {
  width:100%;
  overflow:auto;
  border:1px solid #e2e8f0;
  border-radius:10px;
}

.report-table {
  width:100%;
  border-collapse:collapse;
  min-width:700px;
  background:#fff;
}

.report-table th,
.report-table td {
  padding:10px 12px;
  text-align:left;
  border-bottom:1px solid #e2e8f0;
  font-size:13px;
}

.report-table th {
  background:linear-gradient(180deg, #f8fafc 0%, #eef4fc 100%);
  color:#475569;
  font-weight:700;
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:0.04em;
}

.report-table tbody tr:hover {
  background:#f8fafc;
}

.report-profit-cell {
  color:#15803d;
  font-weight:700;
}

.report-loss-cell {
  color:#b91c1c;
  font-weight:700;
}

.report-empty-cell {
  text-align:center;
  color:#64748b;
}

.outcome-row {
  display:grid;
  grid-template-columns:repeat(4, minmax(0, 1fr));
  gap:8px;
  margin:4px 0 12px;
}

.outcome-chip {
  border:1px solid #dbe3f0;
  background:#f8fafc;
  color:#334155;
  border-radius:999px;
  font-size:12px;
  font-weight:700;
  padding:6px 10px;
  min-height:30px;
  width:100%;
  transition:all 0.2s ease;
}

.outcome-chip:hover {
  background:#f1f5f9;
}

.outcome-chip.active {
  border-color:#bfdbfe;
  background:#eff6ff;
  color:#1d4ed8;
}

.outcome-chip.active.triggered {
  border-color:#86efac;
  background:#f0fdf4;
  color:#166534;
}

.outcome-chip.active.not-triggered {
  border-color:#cbd5e1;
  background:#f1f5f9;
  color:#334155;
}

.outcome-chip.active.profit {
  border-color:#86efac;
  background:#f0fdf4;
  color:#166534;
}

.outcome-chip.active.loss {
  border-color:#fecaca;
  background:#fef2f2;
  color:#991b1b;
}

.history-stock-card.is-selected {
  border-color:#93c5fd;
  box-shadow:0 0 0 2px rgba(59, 130, 246, 0.15);
}

.history-stock-card.is-marked {
  border-color:#d2dff0;
  background:
    linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow:
    var(--shadow-sm),
    0 0 0 1px rgba(59, 130, 246, 0.10);
}

.history-stock-card.tone-triggered.is-marked {
  box-shadow:
    var(--shadow-sm),
    inset 0 0 0 1px rgba(59, 130, 246, 0.10),
    inset 3px 0 0 rgba(37, 99, 235, 0.45);
}

.history-stock-card.tone-not-triggered.is-marked {
  box-shadow:
    var(--shadow-sm),
    inset 0 0 0 1px rgba(148, 163, 184, 0.14),
    inset 3px 0 0 rgba(100, 116, 139, 0.45);
}

.history-stock-card.tone-profit.is-marked {
  box-shadow:
    var(--shadow-sm),
    inset 0 0 0 1px rgba(34, 197, 94, 0.10),
    inset 3px 0 0 rgba(22, 163, 74, 0.45);
}

.history-stock-card.tone-loss.is-marked {
  box-shadow:
    var(--shadow-sm),
    inset 0 0 0 1px rgba(239, 68, 68, 0.10),
    inset 3px 0 0 rgba(220, 38, 38, 0.42);
}

.history-stock-card .history-date-row {
  align-items:flex-start;
  gap:14px;
  flex-wrap:wrap;
}

.history-stock-card .history-date {
  display:block;
  flex:1 1 260px;
  min-width:0;
}

.history-stock-card .history-stats {
  grid-template-columns:repeat(3, minmax(0, 1fr));
}

.history-stock-card .history-stats.trade-levels .history-stat:nth-child(1) {
  background:linear-gradient(180deg, #eff6ff 0%, #e8f1ff 100%);
  border-color:#cfe1ff;
}

.history-stock-card .history-stats.trade-levels .history-stat:nth-child(2) {
  background:linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%);
  border-color:#fed7aa;
}

.history-stock-card .history-stats.trade-levels .history-stat:nth-child(3) {
  background:linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%);
  border-color:#bbf7d0;
}

.history-stock-card .history-stats.day-metrics .history-stat:nth-child(1) {
  background:linear-gradient(180deg, #fefce8 0%, #fef9c3 100%);
  border-color:#fde68a;
}

.history-stock-card .history-stats.day-metrics .history-stat:nth-child(2) {
  background:linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%);
  border-color:#fed7aa;
}

.history-stock-card .history-stats.day-metrics .history-stat:nth-child(3) {
  background:linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
  border-color:#bfdbfe;
}

.history-stock-card .history-stat {
  min-width:0;
}

.stock-price-block {
  margin-left:auto;
  min-width:130px;
  text-align:right;
}

.stock-price-value {
  font-size:22px;
  font-weight:800;
  color:#020617;
}

.stock-change-line {
  margin-top:2px;
  font-size:13px;
  font-weight:700;
  display:flex;
  align-items:center;
  gap:4px;
  justify-content:flex-end;
}

.outcome-summary {
  margin-top:8px;
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}

.status-badge {
  display:inline-flex;
  align-items:center;
  border-radius:999px;
  padding:4px 9px;
  font-size:10.5px;
  font-weight:700;
  line-height:1.2;
  border:1px solid transparent;
  letter-spacing:0.01em;
}

.status-badge.triggered {
  color:#166534;
  background:#f0fdf4;
  border-color:#86efac;
}

.status-badge.not-triggered {
  color:#334155;
  background:#f1f5f9;
  border-color:#cbd5e1;
}

.status-badge.profit {
  color:#166534;
  background:#f0fdf4;
  border-color:#86efac;
}

.status-badge.loss {
  color:#991b1b;
  background:#fef2f2;
  border-color:#fecaca;
}

.status-badge.muted {
  color:#64748b;
  background:#f8fafc;
  border-color:#e2e8f0;
}

.status-saved {
  display:inline-flex;
  align-items:center;
  font-size:10.5px;
  font-weight:700;
  color:#1e3a8a;
  background:#eef2ff;
  border:1px solid #c7d2fe;
  border-radius:999px;
  padding:4px 9px;
}

.status-saved.pending {
  color:#64748b;
  background:#f8fafc;
  border-color:#e2e8f0;
}

.status-saved.done {
  color:#1e3a8a;
  background:#eef2ff;
  border-color:#c7d2fe;
}

.outcome-updated {
  margin-top:6px;
  font-size:11px;
  color:#64748b;
  font-weight:600;
}

.history-stock-header {
  margin-bottom:12px;
}

.stock-meta-name {
  font-weight:600;
  font-size:15px;
  color:#020617;
}

.stock-meta-symbol {
  color:#1d4ed8;
  font-size:12px;
  font-weight:600;
  margin-top:2px;
}

.stat-value-inline {
  display:flex;
  align-items:center;
  justify-content:center;
  gap:4px;
}

.history-badge-content {
  display:inline-flex;
  align-items:center;
  gap:4px;
}

.empty-state {
  text-align:center;
  padding:40px;
}

.empty-state-icon {
  margin-bottom:12px;
  display:inline-flex;
  color:#64748b;
}

.empty-state-title {
  margin:0 0 8px;
}

.empty-state-message {
  color:#64748b;
}

.history-detail-header {
  margin-bottom:16px;
  grid-column:1 / -1;
}

.history-back-btn {
  padding:8px 16px;
  border-radius:8px;
}

.history-detail-list {
  grid-column:1 / -1;
  width:100%;
}

.nifty-status-line {
  font-size:15px;
  font-weight:600;
  margin-bottom:10px;
  display:flex;
  align-items:center;
  gap:8px;
}

.nifty-stat-cell {
  background:#fff;
  border-radius:12px;
  padding:10px;
  text-align:center;
}

.nifty-stat-label {
  font-size:11.5px;
  color:#6b7280;
}

.nifty-stat-value {
  font-size:16.5px;
  font-weight:700;
}

.health-status-line {
  font-size:15px;
  font-weight:600;
  margin-bottom:10px;
  display:flex;
  align-items:center;
  gap:8px;
}

.health-stat-cell {
  background:#f8fafc;
  border:1px dashed #e5e7eb;
  border-radius:12px;
  padding:12px;
  text-align:center;
}

.health-stat-label {
  font-size:11.5px;
  color:#6b7280;
}

.health-stat-value {
  font-size:16.5px;
  font-weight:700;
}

/* Custom Alert Modal */
.custom-alert-overlay {
  position:fixed;
  top:0;
  left:0;
  right:0;
  bottom:0;
  background:rgba(0,0,0,0.5);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:9999;
  animation:fadeIn 0.2s ease;
  backdrop-filter:blur(4px);
}

@keyframes fadeIn {
  from {opacity:0;}
  to {opacity:1;}
}

.custom-alert {
  background:var(--surface);
  border-radius:16px;
  padding:32px;
  max-width:420px;
  width:90%;
  box-shadow:0 16px 40px rgba(15, 23, 42, 0.18);
  border:1px solid #dbe3f0;
  animation:slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position:relative;
}

@keyframes slideUp {
  from {
    opacity:0;
    transform:translateY(20px) scale(0.95);
  }
  to {
    opacity:1;
    transform:translateY(0) scale(1);
  }
}

.custom-alert-icon {
  width:64px;
  height:64px;
  margin:0 auto 20px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:32px;
  animation:scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards;
}

@keyframes scaleIn {
  from {transform:scale(0);}
  to {transform:scale(1);}
}

.custom-alert-icon.success {
  background:linear-gradient(135deg, #f0fdf4, #dcfce7);
  color:var(--success);
}

.custom-alert-icon.error {
  background:linear-gradient(135deg, #fef2f2, #fee2e2);
  color:#dc2626;
}

.custom-alert-title {
  font-size:22px;
  font-weight:700;
  text-align:center;
  margin-bottom:12px;
  color:#0f172a;
}

.custom-alert-message {
  font-size:15px;
  text-align:center;
  color:#64748b;
  line-height:1.6;
  margin-bottom:24px;
}

.custom-alert-details {
  background:#f8fafc;
  border-radius:12px;
  padding:16px;
  margin-bottom:24px;
  border:1px solid #e2e8f0;
}

.custom-alert-detail {
  display:flex;
  justify-content:space-between;
  padding:8px 0;
  border-bottom:1px dashed #dbe3f0;
}

.custom-alert-detail:last-child {
  border-bottom:none;
}

.custom-alert-detail-label {
  font-size:13px;
  color:#64748b;
  font-weight:500;
}

.custom-alert-detail-value {
  font-size:13px;
  color:#0f172a;
  font-weight:700;
}

.custom-alert-button {
  width:100%;
  padding:14px;
  border:none;
  border-radius:12px;
  font-size:15px;
  font-weight:600;
  cursor:pointer;
  transition:all 0.2s;
  background:linear-gradient(135deg, #2563eb, #1d4ed8);
  color:white;
}

.custom-alert-button:hover {
  transform:translateY(-2px);
  box-shadow:0 10px 20px -5px rgba(37, 99, 235, 0.35);
}

.custom-alert-button:active {
  transform:translateY(0);
}

@media (min-width: 1024px) {
  .actions {
    flex-wrap:wrap;
  }

  .actions > button {
    flex:1 1 170px;
  }
}

@media (max-width: 768px) {
  .container {
    padding:20px 16px;
  }
  
  .header h1 {
    font-size:26px;
  }
  
  .actions {
    gap:8px;
    padding:8px;
  }

  .report-wrap {
    padding:12px;
  }

  .report-grid {
    grid-template-columns:repeat(2, minmax(0, 1fr));
  }

  .report-table {
    min-width:560px;
  }

  .report-table th,
  .report-table td {
    padding:8px 10px;
  }
  
  button,a {
    padding:9px 12px;
    font-size:13px;
  }
  
  .history-item {
    padding:14px;
    margin-bottom:12px;
  }
  
  .history-header {
    flex-direction:column;
    align-items:flex-start;
    gap:8px;
    margin-bottom:10px;
  }
  
  .history-date {
    font-size:14px;
  }
  
  .history-stock-count {
    padding:0;
    min-height:auto;
  }

  .stock-count-dot {
    width:10px;
    height:10px;
  }

  .stock-count-dots {
    gap:4px;
  }

  /* History → Stock Detail Cards */
.history-stock-card {
  cursor:default;
  margin-bottom:14px;
  border-radius:18px;
  background:linear-gradient(
    180deg,
    #ffffff 0%,
    #f8fafc 100%
  );
  border:1px solid #e5e7eb;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 8px 20px rgba(15, 23, 42, 0.08);
  transition:all 0.25s ease;
}

.history-stock-card:hover {
  transform:none;
  border-color:var(--border-strong);
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.10),
    0 16px 30px rgba(15, 23, 42, 0.12);
}

  /* Health Card */
.health-card {
  border:1px solid #e5e7eb;
  background:linear-gradient(
    180deg,
    #ffffff 0%,
    #f8fafc 100%
  );
  transition:all 0.25s ease;
}

/* Same hover as history cards */
.health-card:hover {
  transform:translateY(-2px);
  border-color:var(--border-strong);
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.10),
    0 16px 30px rgba(15, 23, 42, 0.12);
}

  .history-stats {
    grid-template-columns:repeat(3, 1fr);
    gap:8px;
    margin-top:12px;
    padding-top:12px;
  }

  .history-stock-card .history-stats {
    grid-template-columns:repeat(2, minmax(0, 1fr));
  }

  .history-stock-card .history-stats.day-metrics {
    grid-template-columns:repeat(3, minmax(0, 1fr));
  }

  .history-stock-card .history-stats.day-metrics .history-stat {
    padding:6px 3px;
  }

  .history-stock-card .history-stats.day-metrics .history-stat-label {
    font-size:9px;
    letter-spacing:0.25px;
  }

  .history-stock-card .history-stats.day-metrics .history-stat-value {
    font-size:12px;
  }

  .history-stock-card .history-stats.trade-levels {
    grid-template-columns:repeat(3, minmax(0, 1fr));
  }

  .history-stock-card .history-stats.trade-levels .history-stat {
    padding:6px 3px;
  }

  .history-stock-card .history-stats.trade-levels .history-stat-label {
    font-size:9px;
    letter-spacing:0.25px;
  }

  .history-stock-card .history-stats.trade-levels .history-stat-value {
    font-size:12px;
  }

  .stock-price-block {
    width:100%;
    margin-left:0;
    text-align:left;
  }

  .stock-change-line {
    justify-content:flex-start;
  }

  .outcome-row {
    grid-template-columns:repeat(2, minmax(0, 1fr));
    margin-top:8px;
  }

  .outcome-summary {
    gap:4px;
  }

  .status-badge,
  .status-saved {
    font-size:10px;
    padding:3px 7px;
  }

  .outcome-updated {
    font-size:10px;
  }
  
  .history-stat {
    padding:6px 4px;
  }
  
  .history-stat-label {
    font-size:10px;
    margin-bottom:3px;
  }
  
  .history-stat-value {
    font-size:13px;
  }
  
  .history-badge {
    font-size:11px;
    padding:3px 8px;
  }
    .history-stock-card .history-stat {
  background:#f8fafc;
  border:1px dashed #e5e7eb;
}

/* Minimal hover – no transform */
button:hover .icon {
  opacity: 0.85;
}

/* REMOVE animation completely */
button.active .icon-history {
  opacity: 1;
}

.history-stock-card .history-stat:hover {
  background:#f1f5f9;
  transform:scale(1.03);
}
.custom-alert-icon.info {
  background:linear-gradient(135deg, #f8fafc, #e5e7eb);
  color:#0f172a;
}

}

@media (prefers-reduced-motion: reduce) {
  * {
    animation:none !important;
    transition:none !important;
    scroll-behavior:auto !important;
  }
}
`;

module.exports = { css };
