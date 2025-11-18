// api/cron.js or pages/api/cron.js
// This is the endpoint that Vercel cron will call

const ChartinkScraper = require('../src/services/scraper.service');
const EmailService = require('../src/services/email.service');
const YahooFinanceService = require('../src/services/yahoo.service');
const logger = require('../src/utils/logger');

// Initialize services
const scraper = new ChartinkScraper();
const emailService = new EmailService();
const yahooFinance = new YahooFinanceService();

async function runDailyTask() {
  try {
    logger.info('🚀 Starting daily task from Vercel cron...');
    
    // Step 1: Get Nifty 50 data and check if above EMA
    logger.info('📊 Checking Nifty 50 EMA condition...');
    const niftyData = await yahooFinance.getNifty50Data();
    
    let stocks = [];
    let filteredStocks = [];
    
    // Step 2: Scrape stocks from Chartink
    logger.info('🔍 Scraping stocks from Chartink...');
    stocks = await scraper.scrapeStocks();
    
    // Step 3: Filter stocks based on Nifty 50 EMA condition
    if (niftyData.isAboveEMA) {
      logger.info(`✅ Nifty 50 (${niftyData.currentPrice}) is above 20 EMA (${niftyData.ema20}). Including all stocks.`);
      
      // Enrich stocks with day high data
      filteredStocks = await yahooFinance.enrichStocksWithDayHigh(stocks);
    } else {
      logger.info(`⚠️ Nifty 50 (${niftyData.currentPrice}) is below 20 EMA (${niftyData.ema20}). Filtering out all stocks.`);
      filteredStocks = [];
    }
    
    // Step 4: Send email report with Nifty data
    await emailService.sendStockReport(filteredStocks, niftyData);
    
    logger.info('✅ Daily task completed successfully');
    
    return {
      success: true,
      niftyData,
      stocksScraped: stocks.length,
      stocksIncluded: filteredStocks.length
    };
  } catch (error) {
    logger.error(`❌ Daily task failed: ${error.message}`);
    logger.error(error.stack);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Verify the request is from Vercel Cron (optional but recommended)
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron request attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const result = await runDailyTask();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};