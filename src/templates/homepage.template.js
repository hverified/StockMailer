// src/templates/homepage.template.js
const styles = require("./homepage.styles");
const scripts = require("./homepage.scripts");

function generate() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Tradewise</title>
<link rel="icon" type="image/svg+xml" href="/tradewise.svg">
<style>${styles.css}</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1 id="greeting"></h1>
    <div class="date" id="dateLine"></div>
  </div>

  <div class="actions">
  <button id="historyBtn" class="secondary" onclick="loadHistory()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
    History
  </button>
  <button id="healthBtn" class="secondary" onclick="loadHealth()">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
  Health
  </button>
  <button id="scanBtn" class="secondary" onclick="loadMarketScan()">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
  Market Scan
  </button>
  <button id="manualScanBtn" onclick="runManualScan()">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
  Run Scan
  </button>
  <a class="docs" href="/api-docs">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    Documentation
  </a>
  </div>

  <div id="content" class="grid"></div>
</div>
<script>${scripts.js}</script>
</body>
</html>`;
}

module.exports = { generate };
