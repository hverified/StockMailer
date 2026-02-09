// src/templates/homepage.styles.js
const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&display=swap');

:root {
  --bg:#f3f5f8;
  --surface:#ffffff;
  --surface-soft:#f8fafc;
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
  background:var(--bg);
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
}

.header .date {
  font-size:13px;
  font-weight:600;
  color:var(--muted);
  letter-spacing:0.01em;
}

.actions {
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:stretch;
  margin:26px 0;
  padding:10px;
  background:rgba(255, 255, 255, 0.75);
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

.count-strip {
  background:#f8fafc;
  border:1px solid #dbe3f0;
  border-radius:12px;
  padding:10px 12px;
  font-size:13px;
  font-weight:600;
  color:#1e3a8a;
}

.history-item {
  background:var(--surface);
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
  background:#f8fafc;
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
  gap:6px;
  padding:6px 12px;
  background:#1e3a8a;
  color:white;
  border-radius:999px;
  font-size:13px;
  font-weight:600;
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
    flex-wrap:nowrap;
  }

  .actions > button {
    flex:1 1 0;
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
    font-size:12px;
    padding:4px 10px;
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
  transform:translateY(-2px);
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
