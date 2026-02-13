const styles = require("./homepage.styles");
const scripts = require("./homepage.scripts");
const {
  iconHistory,
  iconSearch,
  iconHealth,
  iconPlay,
  iconReport,
} = require("./icons");

function generate() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tradewise</title>
    <link rel="icon" type="image/svg+xml" href="/tradewise.svg" />
    <style>${styles.css}</style>
  </head>

  <body>
    <div class="container">
      <header class="header">
        <div class="header-top">
          <div>
            <h1 id="greeting"></h1>
            <div class="date" id="dateLine"></div>
          </div>
          <div id="authControls"></div>
        </div>
      </header>

      <div id="authPanel"></div>

      <div class="actions">
        <button class="secondary" id="historyBtn" onclick="loadHistory()">
          ${iconHistory()}
          <span>History</span>
        </button>

        <button class="secondary" id="scanBtn" onclick="loadMarketScan()">
          ${iconSearch()}
          <span>Market Scan</span>
        </button>

        <button class="secondary" id="healthBtn" onclick="loadHealth()">
          ${iconHealth()}
          <span>Health</span>
        </button>

        <button class="secondary" id="reportBtn" onclick="loadStocksReport()">
          ${iconReport()}
          <span>Stocks Report</span>
        </button>

        <button id="manualScanBtn" onclick="runManualScan()">
          ${iconPlay()}
          <span>Run Scan</span>
        </button>
      </div>

      <div id="content" class="grid"></div>
    </div>

    <script>${scripts.js}</script>
  </body>
</html>`;
}

module.exports = { generate };
