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
    <a class="docs" href="/api-docs">📘 Documentation</a>
    <button id="healthBtn" class="secondary" onclick="loadHealth()">❤️ Health</button>
    <button id="scanBtn" class="secondary" onclick="loadMarketScan()">🔍 Market Scan</button>
    <button id="historyBtn" class="secondary" onclick="loadHistory()">📊 History</button>
    <button id="manualScanBtn" onclick="runManualScan()">▶️ Run Scan</button>
  </div>

  <div id="content" class="grid"></div>
</div>
<script>${scripts.js}</script>
</body>
</html>`;
}

module.exports = { generate };
