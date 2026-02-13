// src/routes/index.js
/**
 * Main API Routes
 * Handles email testing and report generation
 */

const express = require("express");
const ChartinkScraper = require("../services/scraper.service");
const EmailService = require("../services/email.service");
const MarketDataService = require("../services/market.service");
const logger = require("../utils/logger");
const DateUtil = require("../utils/date.util");
const {
  asyncHandler,
  AppError,
} = require("../middleware/error-handler.middleware");

const router = express.Router();

// Initialize services
const scraper = new ChartinkScraper();
const emailService = new EmailService();
const marketService = new MarketDataService();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and get system status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: DateUtil.formatDateTime(),
    scheduler: "active",
    morningReport: "9:29 AM (Mon-Fri)",
    eveningReport: "5:00 PM (Mon-Fri)",
  });
});

/**
 * @swagger
 * /trigger-report:
 *   post:
 *     summary: Manually trigger stock report generation
 *     description: Scrapes stocks from Chartink, checks Nifty 50 EMA condition, enriches with day high data, and sends email report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Report generated and sent successfully
 */
router.post(
  "/trigger-report",
  asyncHandler(async (req, res) => {
    logger.info("Manual trigger: Starting stock report generation...");

    // Check Nifty 50 condition
    const niftyData = await marketService.getNifty50Data();

    // Scrape stocks
    const stocks = await scraper.scrapeStocks();

    // Filter stocks based on Nifty 50 EMA
    let filteredStocks = [];
    if (niftyData.isAboveEMA) {
      logger.info(`Nifty above EMA - including ${stocks.length} stocks`);
      filteredStocks = await marketService.enrichStocksWithDayHigh(stocks);
    } else {
      logger.info("Nifty below EMA - excluding all stocks");
    }

    // Send email only when shortlisted stocks are available
    const emailResult = await emailService.sendStockReport(
      filteredStocks,
      niftyData
    );

    res.json({
      success: true,
      message: emailResult.skipped
        ? "Report generated. No shortlisted stocks, email skipped"
        : "Report generated and sent successfully",
      emailSent: !emailResult.skipped,
      niftyAboveEMA: niftyData.isAboveEMA,
      niftyPrice: niftyData.currentPrice,
      ema20: niftyData.ema20,
      stocksScraped: stocks.length,
      stocksIncluded: filteredStocks.length,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @swagger
 * /trigger-morning-report:
 *   post:
 *     summary: Manually trigger morning pre-market report
 *     description: Scrapes stocks, fetches current and previous day highs, and sends morning email report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Morning report generated and sent successfully
 */
router.post(
  "/trigger-morning-report",
  asyncHandler(async (req, res) => {
    logger.info("Manual trigger: Starting morning report generation...");

    // Check Nifty 50 condition
    const niftyData = await marketService.getNifty50Data();

    // Scrape stocks
    const stocks = await scraper.scrapeStocks();

    // Enrich stocks with current and previous day highs
    const enrichedStocks = await marketService.enrichStocksWithDayAndPrevHighs(
      stocks
    );

    // Send morning email only when shortlisted stocks are available
    const emailResult = await emailService.sendMorningStockReport(
      enrichedStocks,
      niftyData
    );

    res.json({
      success: true,
      message: emailResult.skipped
        ? "Morning report generated. No shortlisted stocks, email skipped"
        : "Morning report generated and sent successfully",
      emailSent: !emailResult.skipped,
      niftyAboveEMA: niftyData.isAboveEMA,
      niftyPrice: niftyData.currentPrice,
      ema20: niftyData.ema20,
      stocksScraped: stocks.length,
      stocksProcessed: enrichedStocks.length,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @swagger
 * /test-scrape:
 *   get:
 *     summary: Test stock scraping from Chartink
 *     description: Scrapes stocks from Chartink without sending email
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: Successfully scraped stocks
 */
router.get(
  "/test-scrape",
  asyncHandler(async (req, res) => {
    const stocks = await scraper.scrapeStocks();
    res.json({
      success: true,
      count: stocks.length,
      data: stocks,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @swagger
 * /test-nifty:
 *   get:
 *     summary: Test Nifty 50 EMA calculation
 *     description: Fetches current Nifty 50 price and calculates 20-day EMA
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: Successfully fetched Nifty 50 data
 */
router.get(
  "/test-nifty",
  asyncHandler(async (req, res) => {
    const niftyData = await marketService.getNifty50Data();
    res.json({
      success: true,
      data: niftyData,
      message: niftyData.isAboveEMA
        ? "Nifty is above 20 EMA"
        : "Nifty is below 20 EMA",
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @swagger
 * /test-email:
 *   post:
 *     summary: Send test email
 *     description: Sends a test email with dummy stock data
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: Test email sent successfully
 */
router.post(
  "/test-email",
  asyncHandler(async (req, res) => {
    await emailService.sendTestEmail();
    res.json({
      success: true,
      message: "Test email sent successfully",
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @swagger
 * /test-morning-email:
 *   post:
 *     summary: Send test morning email
 *     description: Sends a test morning pre-market email with dummy stock data
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: Test morning email sent successfully
 */
router.post(
  "/test-morning-email",
  asyncHandler(async (req, res) => {
    await emailService.sendTestMorningEmail();
    res.json({
      success: true,
      message: "Test morning email sent successfully",
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @swagger
 * /quote/{symbol}:
 *   get:
 *     summary: Get stock quote from NSE
 *     description: Fetches real-time stock quote data including price, change, volume, and market cap
 *     tags: [Stock Data]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol (NSE)
 *         example: RELIANCE
 *     responses:
 *       200:
 *         description: Successfully fetched stock quote
 */
router.get(
  "/quote/:symbol",
  asyncHandler(async (req, res) => {
    const { symbol } = req.params;

    if (!symbol) {
      throw new AppError("Stock symbol is required", 400);
    }

    const quote = await marketService.getStockQuote(symbol);

    if (!quote) {
      throw new AppError(`Quote not found for symbol: ${symbol}`, 404);
    }

    res.json({
      success: true,
      data: quote,
      timestamp: new Date().toISOString(),
    });
  })
);

module.exports = router;
