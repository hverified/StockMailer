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

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: helpers.currentDateTime(),
    scheduler: 'active',
    nextRun: '5:00 PM daily'
  });
});

// Debug yahoo-finance2 exports
router.get('/debug-yahoo', (req, res) => {
  const yf = require('yahoo-finance2');
  res.json({
    type: typeof yf,
    keys: Object.keys(yf),
    hasQuote: typeof yf.quote,
    hasQuoteSummary: typeof yf.quoteSummary,
    hasHistorical: typeof yf.historical,
    hasDefault: typeof yf.default,
    defaultKeys: yf.default ? Object.keys(yf.default) : null
  });
});

// Manual trigger for scraping and email with Nifty 50 check
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

// Test scraping only
router.get('/test-scrape', async (req, res) => {
  try {
    const stocks = await scraper.scrapeStocks();
    res.json({ success: true, count: stocks.length, data: stocks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Nifty 50 EMA check
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

// Test email with dummy data
router.post('/test-email', async (req, res) => {
  try {
    await emailService.sendTestEmail();
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stock quote (Yahoo Finance)
router.get('/quote/:symbol', async (req, res) => {
  try {
    const quote = await yahooFinance.getStockQuote(req.params.symbol);
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;