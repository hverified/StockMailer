// api/cron.js
// Vercel serverless function for cron job

const ChartinkScraper = require('../src/services/scraper.service');
const EmailService = require('../src/services/email.service');
const YahooFinanceService = require('../src/services/yahoo.service');
const logger = require('../src/utils/logger');

module.exports = async (req, res) => {
  // Only allow POST or GET from Vercel Cron
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: Verify the request is from Vercel Cron
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron request attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logger.info('🚀 Starting Vercel cron job...');
    
    // Initialize services
    const scraper = new ChartinkScraper();
    const emailService = new EmailService();
    const yahooFinance = new YahooFinanceService();
    
    // Step 1: Get Nifty 50 data and check if above EMA
    logger.info('📊 Checking Nifty 50 EMA condition...');
    const niftyData = await yahooFinance.getNifty50Data();
    
    // Step 2: Scrape stocks from Chartink
    logger.info('🔍 Scraping stocks from Chartink...');
    const stocks = await scraper.scrapeStocks();
    
    // Step 3: Filter stocks based on Nifty 50 EMA condition
    let filteredStocks = [];
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
    
    logger.info('✅ Vercel cron job completed successfully');
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      niftyData: {
        currentPrice: niftyData.currentPrice,
        ema20: niftyData.ema20,
        isAboveEMA: niftyData.isAboveEMA
      },
      stocksScraped: stocks.length,
      stocksIncluded: filteredStocks.length
    });
  } catch (error) {
    logger.error(`❌ Vercel cron job failed: ${error.message}`);
    logger.error(error.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};