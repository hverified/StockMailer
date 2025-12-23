const express = require('express');
const ChartinkScraper = require('../services/scraper.service');
const EmailService = require('../services/email.service');
const YahooFinanceService = require('../services/yahoo.service');
const StorageService = require('../services/storage.service');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

const router = express.Router();
const scraper = new ChartinkScraper();
const emailService = new EmailService();
const yahooFinance = new YahooFinanceService();
const storage = new StorageService();

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
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: helpers.currentDateTime(),
    scheduler: 'active',
    morningReport: '9:29 AM (Mon-Fri)',
    eveningReport: '5:00 PM (Mon-Fri)'
  });
});

/**
 * @swagger
 * /trigger-report:
 *   post:
 *     summary: Manually trigger evening stock report
 *     description: Scrapes stocks, checks Nifty 50, saves to file, and sends email only if stocks found
 *     tags: [Reports]
 */
router.post('/trigger-report', async (req, res) => {
  try {
    logger.info('Manual trigger: Starting evening report generation...');
    
    // Check Nifty 50 condition
    const niftyData = await yahooFinance.getNifty50Data();
    
    // Scrape stocks
    const stocks = await scraper.scrapeStocks();
    
    // Filter stocks based on Nifty 50 EMA
    let filteredStocks = [];
    if (niftyData.isAboveEMA) {
      filteredStocks = await yahooFinance.enrichStocksWithDayHigh(stocks);
    }
    
    // Save to file
    await storage.saveStocks(filteredStocks, niftyData);
    
    // Send email only if stocks found
    let emailSent = false;
    if (filteredStocks.length > 0) {
      await emailService.sendStockReport(filteredStocks, niftyData);
      emailSent = true;
    }
    
    res.json({ 
      success: true, 
      message: emailSent ? 'Report generated and sent successfully' : 'No stocks found - email skipped',
      niftyAboveEMA: niftyData.isAboveEMA,
      niftyPrice: niftyData.currentPrice,
      ema20: niftyData.ema20,
      stocksScraped: stocks.length,
      stocksIncluded: filteredStocks.length,
      emailSent
    });
  } catch (error) {
    logger.error(`Manual trigger failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /trigger-morning-report:
 *   post:
 *     summary: Manually trigger morning pre-market report
 *     description: Loads stocks from file, enriches with data, and sends email only if stocks found
 *     tags: [Reports]
 */
router.post('/trigger-morning-report', async (req, res) => {
  try {
    logger.info('Manual trigger: Starting morning report generation...');
    
    // Load stocks from file
    const savedData = await storage.loadStocks();
    
    if (!savedData || !savedData.stocks || savedData.stocks.length === 0) {
      return res.json({
        success: true,
        message: 'No stocks found in saved file - morning report skipped',
        stocksProcessed: 0,
        emailSent: false
      });
    }
    
    const stocks = savedData.stocks;
    const niftyData = savedData.niftyData;
    
    // Enrich stocks with current and previous day highs
    const enrichedStocks = await yahooFinance.enrichStocksWithDayAndPrevHighs(stocks);
    
    // Send morning email only if stocks exist
    let emailSent = false;
    if (enrichedStocks.length > 0) {
      await emailService.sendMorningStockReport(enrichedStocks, niftyData);
      emailSent = true;
    }
    
    res.json({ 
      success: true, 
      message: emailSent ? 'Morning report generated and sent successfully' : 'No stocks to process - email skipped',
      niftyAboveEMA: niftyData.isAboveEMA,
      niftyPrice: niftyData.currentPrice,
      ema20: niftyData.ema20,
      stocksProcessed: enrichedStocks.length,
      emailSent
    });
  } catch (error) {
    logger.error(`Manual morning trigger failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /test-scrape:
 *   get:
 *     summary: Test stock scraping from Chartink
 *     tags: [Testing]
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
 *     tags: [Testing]
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
 *     tags: [Testing]
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
 * /test-morning-email:
 *   post:
 *     summary: Send test morning email
 *     tags: [Testing]
 */
router.post('/test-morning-email', async (req, res) => {
  try {
    await emailService.sendTestMorningEmail();
    res.json({ success: true, message: 'Test morning email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /quote/{symbol}:
 *   get:
 *     summary: Get stock quote from Yahoo Finance
 *     tags: [Stock Data]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         example: RELIANCE
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    const quote = await yahooFinance.getStockQuote(req.params.symbol);
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /saved-stocks:
 *   get:
 *     summary: View saved stocks from file
 *     description: Returns the stocks saved from the last evening report
 *     tags: [Stock Data]
 */
router.get('/saved-stocks', async (req, res) => {
  try {
    const savedData = await storage.loadStocks();
    if (!savedData) {
      return res.json({ 
        success: true, 
        message: 'No saved stocks found',
        data: null 
      });
    }
    res.json({ 
      success: true, 
      data: savedData,
      count: savedData.stocks.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /clear-saved-stocks:
 *   delete:
 *     summary: Clear saved stocks file
 *     description: Deletes the saved stocks file
 *     tags: [Stock Data]
 */
router.delete('/clear-saved-stocks', async (req, res) => {
  try {
    await storage.clearStocks();
    res.json({ 
      success: true, 
      message: 'Saved stocks cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;