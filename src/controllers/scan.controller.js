// src/controllers/scan.controller.js
const ChartinkScraper = require("../services/scraper.service");
const MarketDataService = require("../services/market.service");
const StockDBService = require("../services/stock.db.service");
const logger = require("../utils/logger");

class ScanController {
  constructor() {
    this.scraper = null;
    this.marketService = null;
    this.stockDBService = null;

    this.testScrape = this.testScrape.bind(this);
    this.getNiftyStatus = this.getNiftyStatus.bind(this);
    this.runManualScan = this.runManualScan.bind(this);
  }

  _ensureServices() {
    if (!this.scraper) {
      this.scraper = new ChartinkScraper();
      this.marketService = new MarketDataService();
      this.stockDBService = new StockDBService();
    }
  }

  async testScrape(req, res) {
    try {
      this._ensureServices();
      const stocks = await this.scraper.scrapeStocks();
      res.json({
        count: stocks.length,
        stocks: stocks.slice(0, 25),
      });
    } catch (error) {
      logger.error(`Test scrape failed: ${error.message}`);
      res.status(500).json({
        error: "Failed to scrape stocks",
        message: error.message,
      });
    }
  }

  async getNiftyStatus(req, res) {
    try {
      this._ensureServices();
      const niftyData = await this.marketService.getNifty50Data();
      res.json({
        price: niftyData.currentPrice,
        ema20: niftyData.ema20,
        aboveEMA: niftyData.isAboveEMA,
      });
    } catch (error) {
      logger.error(`Nifty status fetch failed: ${error.message}`);
      res.status(500).json({
        error: "Failed to fetch Nifty status",
        message: error.message,
      });
    }
  }

  async runManualScan(req, res) {
    try {
      this._ensureServices();
      logger.info("Manual scan triggered from UI");

      const niftyData = await this.marketService.getNifty50Data();
      const stocks = await this.scraper.scrapeStocks();

      let filteredStocks = [];
      if (niftyData.isAboveEMA) {
        filteredStocks = await this.marketService.enrichStocksWithDayHigh(
          stocks
        );
      }

      await this.stockDBService.saveStocks(filteredStocks, niftyData);

      res.json({
        success: true,
        stocksScraped: stocks.length,
        stocksSaved: filteredStocks.length,
        niftyData,
      });
    } catch (error) {
      logger.error(`Manual scan failed: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ScanController();
