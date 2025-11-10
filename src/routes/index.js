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

// Manual trigger for scraping and email
router.post('/trigger-report', async (req, res) => {
  try {
    logger.info('Manual trigger: Starting stock report generation...');
    const stocks = await scraper.scrapeStocks();
    await emailService.sendStockReport(stocks);
    res.json({ 
      success: true, 
      message: 'Report generated and sent successfully',
      stocksCount: stocks.length
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