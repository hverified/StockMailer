// src/controllers/scan.controller.js
/**
 * Scan Controller
 * Handles stock scanning and market data operations
 */

const ChartinkScraper = require("../services/scraper.service");
const MarketDataService = require("../services/market.service");
const StockDBService = require("../services/stock.db.service");
const logger = require("../utils/logger");
const { AppError } = require("../middleware/error-handler.middleware");

class ScanController {
  constructor() {
    this.scraper = null;
    this.marketService = null;
    this.stockDBService = null;

    // Bind methods
    this.testScrape = this.testScrape.bind(this);
    this.getNiftyStatus = this.getNiftyStatus.bind(this);
    this.runManualScan = this.runManualScan.bind(this);
  }

  /**
   * Initialize services if not already initialized
   * @private
   */
  _ensureServices() {
    if (!this.scraper) {
      this.scraper = new ChartinkScraper();
      this.marketService = new MarketDataService();
      this.stockDBService = new StockDBService();
    }
  }

  /**
   * Test scrape stocks from Chartink
   * @route GET /test-scrape
   */
  async testScrape(req, res) {
    try {
      this._ensureServices();

      logger.info("Testing stock scrape from Chartink...");
      const stocks = await this.scraper.scrapeStocks();

      res.json({
        success: true,
        count: stocks.length,
        stocks: stocks.slice(0, 25),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Test scrape failed:", error);
      throw new AppError("Failed to scrape stocks: " + error.message, 500);
    }
  }

  /**
   * Get Nifty 50 status and EMA comparison
   * @route GET /nifty-status
   */
  async getNiftyStatus(req, res) {
    try {
      this._ensureServices();

      logger.info("Fetching Nifty 50 status...");
      const niftyData = await this.marketService.getNifty50Data();

      res.json({
        success: true,
        price: niftyData.currentPrice,
        ema20: niftyData.ema20,
        aboveEMA: niftyData.isAboveEMA,
        difference: (niftyData.currentPrice - niftyData.ema20).toFixed(2),
        differencePercent: (
          ((niftyData.currentPrice - niftyData.ema20) / niftyData.ema20) *
          100
        ).toFixed(2),
        timestamp: niftyData.timestamp,
      });
    } catch (error) {
      logger.error("Nifty status fetch failed:", error);
      throw new AppError("Failed to fetch Nifty status: " + error.message, 500);
    }
  }

  /**
   * Run manual scan and save to database
   * @route POST /manual-scan
   */
  async runManualScan(req, res) {
    try {
      this._ensureServices();

      logger.info("Manual scan triggered from UI");

      // Get Nifty 50 data
      logger.info("Fetching Nifty 50 data...");
      const niftyData = await this.marketService.getNifty50Data();

      // Scrape stocks
      logger.info("Scraping stocks from Chartink...");
      const stocks = await this.scraper.scrapeStocks();

      // Filter and enrich based on Nifty EMA
      let filteredStocks = [];
      if (niftyData.isAboveEMA) {
        logger.info(`Nifty above EMA - enriching ${stocks.length} stocks`);
        filteredStocks = await this.marketService.enrichStocksWithDayHigh(
          stocks
        );
      } else {
        logger.info("Nifty below EMA - no stocks will be saved");
      }

      // Save to database
      logger.info("Saving scan results to database...");
      await this.stockDBService.saveStocks(filteredStocks, niftyData);

      res.json({
        success: true,
        message: "Manual scan completed successfully",
        stocksScraped: stocks.length,
        stocksSaved: filteredStocks.length,
        niftyData: {
          currentPrice: niftyData.currentPrice,
          ema20: niftyData.ema20,
          isAboveEMA: niftyData.isAboveEMA,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Manual scan failed:", error);
      throw new AppError("Manual scan failed: " + error.message, 500);
    }
  }
}

// Export singleton instance
module.exports = new ScanController();
