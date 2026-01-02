// src/templates/homepage.styles.js
const css = `
:root {
  --bg:#f9fafb;
  --card:#ffffff;
  --text:#111827;
  --muted:#6b7280;
  --accent:#4f46e5;
  --active:#eef2ff;
  --border:#e5e7eb;
}

body {
  margin:0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
  background:var(--bg);
  color:var(--text);
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
}

button,a {
  padding:11px 18px;
  border-radius:999px;
  font-weight:600;
  font-size:14px;
  border:1px solid var(--border);
  cursor:pointer;
  text-decoration:none;
  background:white;
  color:var(--text);
  transition:all 0.2s;
}

button:hover,a:hover {
  transform:translateY(-1px);
  box-shadow:0 4px 12px rgba(0,0,0,0.1);
}

button.secondary.active {
  background:var(--active);
  border-color:var(--accent);
  color:var(--accent);
}

button:disabled {
  opacity:0.5;
  cursor:not-allowed;
  transform:none;
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
  box-shadow:0 12px 30px rgba(0,0,0,.12);
  animation:fadeUp .25s ease forwards;
}

@keyframes fadeUp {
  from {opacity:0; transform:translateY(6px);}
  to {opacity:1; transform:none;}
}

.skeleton {
  height:130px;
  border-radius:16px;
  background:linear-gradient(90deg,#e5e7eb,#f1f5f9,#e5e7eb);
  background-size:200% 100%;
  animation:shimmer 1.2s infinite;
}

@keyframes shimmer {
  to {background-position:-200% 0;}
}

.stock-grid {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:14px;
}

.count-strip {
  background:#f8fafc;
  border:1px solid var(--border);
  border-radius:12px;
  padding:10px 14px;
  font-size:14px;
  font-weight:600;
  color:#475569;
}

.history-item {
  background:white;
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:14px;
  margin-bottom:10px;
  cursor:pointer;
  transition:all 0.2s;
}

.history-item:hover {
  border-color:#4f46e5;
  box-shadow:0 4px 12px rgba(79,70,229,0.1);
  transform:translateY(-2px);
}

.history-date {
  font-weight:600;
  font-size:15px;
  color:#111827;
}

.history-meta {
  font-size:13px;
  color:#6b7280;
  margin-top:4px;
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
  }
  
  button,a {
    padding:9px 14px;
    font-size:13px;
  }
}
`;

module.exports = { css };
