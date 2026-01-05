// src/templates/homepage.styles.js
const css = `
:root {
  --bg: linear-gradient(
  180deg,
  #f8fafc 0%,
  #f1f5f9 40%,
  #e5e7eb 100%
);
  --card:#ffffff;
  --text:#0f172a;
  --muted:#64748b;
  --accent:#0ea5e9;
  --active:#e0f2fe;
  --border:#bae6fd;
}

body {
  margin:0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
}

.container {
  max-width:1200px;
  margin:auto;
  padding:36px 32px;
}

.header {
  display:flex;
  flex-direction:column;
  gap:4px;
}

.header h1 {
  font-size:26px;
  font-weight:600;
  letter-spacing:-0.3px;
  margin:0;
}

.header .date {
  font-size:14px;
  color:var(--muted);
}

.actions {
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin:28px 0;
  padding-bottom:20px;
  border-bottom:2px solid var(--border);
}

button,a {
  padding:10px 16px;
  border-radius:10px;
  font-weight:600;
  font-size:14px;
  border:1px solid #e5e7eb;
  cursor:pointer;
  text-decoration:none;
  background:#f8fafc;
  color:#475569;
  transition:all 0.25s ease;
}


button:hover,a:hover {
  transform:translateY(-1px);
  box-shadow:0 4px 12px rgba(14,165,233,0.2);
}

button.secondary.active {
  background:#ffffff;
  color:#0f172a;
  border-color:#e5e7eb;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    inset 0 -2px 0 #0ea5e9;
}

button.secondary:hover {
  background:#f1f5f9;
  border-color:#cbd5f5;
  box-shadow:0 2px 6px rgba(15, 23, 42, 0.08);
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
  background:#0ea5e9;
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
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:18px;
}

  .card {
  background:var(--card);
  border-radius:16px;
  padding:18px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.08),
    0 10px 25px rgba(15, 23, 42, 0.08);
  animation:fadeUp .25s ease forwards;
}


@keyframes fadeUp {
  from {opacity:0; transform:translateY(6px);}
  to {opacity:1; transform:none;}
}


.skeleton {
  height:130px;
  border-radius:16px;
  background:linear-gradient(
    90deg,
    #e5e7eb 25%,
    #f1f5f9 37%,
    #e5e7eb 63%
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
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:14px;
}

.count-strip {
  background:#f0f9ff;
  border:1px solid var(--border);
  border-radius:12px;
  padding:10px 14px;
  font-size:14px;
  font-weight:600;
  color:#0369a1;
}

.history-item {
  background:white;
  border-radius:16px;
  padding:20px;
  margin-bottom:16px;
  cursor:pointer;
  transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border:2px solid transparent;
  box-shadow:0 4px 6px -1px rgba(14,165,233,0.1), 0 2px 4px -1px rgba(14,165,233,0.06);
  position:relative;
  overflow:hidden;
}

.history-item::before {
  content:'';
  position:absolute;
  top:0;
  left:0;
  right:0;
  height:4px;
  background:linear-gradient(90deg, #0ea5e9, #06b6d4);
  transform:scaleX(0);
  transform-origin:left;
  transition:transform 0.3s ease;
}

.history-item:hover {
  transform:translateY(-2px);
  border-color:#cbd5e1;
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.10),
    0 16px 30px rgba(15, 23, 42, 0.12);
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
  color:#166534;
  border:1px solid #86efac;
}

.history-badge.bearish {
  background:#fef2f2;
  color:#991b1b;
  border-color:#fca5a5;
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
  background:#f0f9ff;
  border-radius:10px;
  transition:all 0.2s;
}

.history-stat:hover {
  background:#e0f2fe;
  transform:scale(1.05);
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
  background:linear-gradient(135deg, #0ea5e9, #06b6d4);
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
  background:white;
  border-radius:20px;
  padding:32px;
  max-width:420px;
  width:90%;
  box-shadow:0 25px 50px -12px rgba(14,165,233,0.25);
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
  color:#16a34a;
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
  background:#f0f9ff;
  border-radius:12px;
  padding:16px;
  margin-bottom:24px;
}

.custom-alert-detail {
  display:flex;
  justify-content:space-between;
  padding:8px 0;
  border-bottom:1px dashed #bae6fd;
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
  background:linear-gradient(135deg, #0ea5e9, #06b6d4);
  color:white;
}

.custom-alert-button:hover {
  transform:translateY(-2px);
  box-shadow:0 10px 20px -5px rgba(14,165,233,0.4);
}

.custom-alert-button:active {
  transform:translateY(0);
}

@media (max-width: 768px) {
  .container {
    padding:20px 16px;
  }
  
  .header h1 {
    font-size:22px;
  }
  
  .actions {
    gap:8px;
    padding-bottom:16px;
  }
  
  button,a {
    padding:9px 14px;
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
  border-color:#cbd5e1;
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
  border-color:#cbd5e1;
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

.history-stock-card .history-stat:hover {
  background:#f1f5f9;
  transform:scale(1.03);
}
.custom-alert-icon.info {
  background:linear-gradient(135deg, #f8fafc, #e5e7eb);
  color:#0f172a;
}

}
`;

module.exports = { css };
