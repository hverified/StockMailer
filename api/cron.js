// api/cron.js
// Vercel serverless function for evening cron job

const ChartinkScraper = require('../src/services/scraper.service');
const EmailService = require('../src/services/email.service');
const YahooFinanceService = require('../src/services/yahoo.service');
const StorageService = require('../src/services/storage.service');
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
    logger.info('🚀 Starting Vercel evening cron job...');
    
    // Initialize services
    const scraper = new ChartinkScraper();
    const emailService = new EmailService();
    const yahooFinance = new YahooFinanceService();
    const storage = new StorageService();
    
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
    
    // Step 4: Save stocks to file (even if empty, for morning report)
    await storage.saveStocks(filteredStocks, niftyData);
    console.log("Saved Stocks \n\n", filteredStocks.length);
    
    
    // Step 5: Send email ONLY if stocks found
    if (filteredStocks.length > 0) {
      await emailService.sendStockReport(filteredStocks, niftyData);
      logger.info(`✅ Evening report sent with ${filteredStocks.length} stocks`);
    } else {
      logger.info('⏭️ No stocks found - skipping email');
    }
    
    logger.info('✅ Vercel evening cron job completed successfully');
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      niftyData: {
        currentPrice: niftyData.currentPrice,
        ema20: niftyData.ema20,
        isAboveEMA: niftyData.isAboveEMA
      },
      stocksScraped: stocks.length,
      stocksIncluded: filteredStocks.length,
      emailSent: filteredStocks.length > 0
    });
  } catch (error) {
    logger.error(`❌ Vercel evening cron job failed: ${error.message}`);
    logger.error(error.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};