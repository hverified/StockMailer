const express = require('express');
const ChartinkScraper = require('../services/scraper.service');
const EmailService = require('../services/email.service');
const YahooFinanceService = require('../services/yahoo.service');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

const router = express.Router();
const scraper = new ChartinkScraper();
const emailService = new EmailService();
const yahooFinance = new YahooFinanceService();

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   example: "18/11/2025, 5:00:00 PM"
 *                 scheduler:
 *                   type: string
 *                   example: active
 *                 nextRun:
 *                   type: string
 *                   example: "5:00 PM daily"
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: helpers.currentDateTime(),
    scheduler: 'active',
    nextRun: '5:00 PM daily'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Report generated and sent successfully
 *                 niftyAboveEMA:
 *                   type: boolean
 *                   example: true
 *                 niftyPrice:
 *                   type: number
 *                   example: 19850.25
 *                 ema20:
 *                   type: number
 *                   example: 19500.00
 *                 stocksScraped:
 *                   type: integer
 *                   example: 25
 *                 stocksIncluded:
 *                   type: integer
 *                   example: 25
 *       500:
 *         description: Error generating report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/trigger-report', async (req, res) => {
  try {
    logger.info('Manual trigger: Starting stock report generation...');
    
    // Check Nifty 50 condition
    const niftyData = await yahooFinance.getNifty50Data();
    
    // Scrape stocks
    const stocks = await scraper.scrapeStocks();
    
    // Filter stocks based on Nifty 50 EMA
    let filteredStocks = [];
    if (niftyData.isAboveEMA) {
      filteredStocks = await yahooFinance.enrichStocksWithDayHigh(stocks);
    }
    
    // Send email
    await emailService.sendStockReport(filteredStocks, niftyData);
    
    res.json({ 
      success: true, 
      message: 'Report generated and sent successfully',
      niftyAboveEMA: niftyData.isAboveEMA,
      niftyPrice: niftyData.currentPrice,
      ema20: niftyData.ema20,
      stocksScraped: stocks.length,
      stocksIncluded: filteredStocks.length
    });
  } catch (error) {
    logger.error(`Manual trigger failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stock'
 *       500:
 *         description: Error scraping stocks
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/test-scrape', async (req, res) => {
  try {
    const stocks = await scraper.scrapeStocks();
    res.json({ success: true, count: stocks.length, data: stocks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NiftyData'
 *                 message:
 *                   type: string
 *                   example: Nifty is above 20 EMA
 *       500:
 *         description: Error fetching Nifty data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/test-nifty', async (req, res) => {
  try {
    const niftyData = await yahooFinance.getNifty50Data();
    res.json({ 
      success: true, 
      data: niftyData,
      message: niftyData.isAboveEMA ? 'Nifty is above 20 EMA' : 'Nifty is below 20 EMA'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Test email sent successfully
 *       500:
 *         description: Error sending email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/test-email', async (req, res) => {
  try {
    await emailService.sendTestEmail();
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /quote/{symbol}:
 *   get:
 *     summary: Get stock quote from Yahoo Finance
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/StockQuote'
 *       500:
 *         description: Error fetching quote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    const quote = await yahooFinance.getStockQuote(req.params.symbol);
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;