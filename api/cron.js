// api/cron.js
const ChartinkScraper = require('../src/services/scraper.service');
const EmailService = require('../src/services/email.service');
const MarketDataService = require('../src/services/market.service');
const StockDBService = require('../src/services/stock.db.service');
const mongodb = require('../src/config/mongodb');
const logger = require('../src/utils/logger');

module.exports = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron request attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logger.info('🚀 Starting Vercel cron job...');
    
    // Connect to MongoDB
    await mongodb.connect();
    
    const scraper = new ChartinkScraper();
    const emailService = new EmailService();
    const marketService = new MarketDataService();
    const stockDBService = new StockDBService();
    
    // Get Nifty 50 data (saves to DB automatically)
    logger.info('📊 Checking Nifty 50 EMA condition...');
    const niftyData = await marketService.getNifty50Data();
    
    // Scrape stocks
    logger.info('🔍 Scraping stocks from Chartink...');
    const stocks = await scraper.scrapeStocks();
    
    // Filter and enrich stocks
    let filteredStocks = [];
    if (niftyData.isAboveEMA) {
      logger.info(`✅ Nifty 50 (${niftyData.currentPrice}) is above 20 EMA (${niftyData.ema20}). Including all stocks.`);
      filteredStocks = await marketService.enrichStocksWithDayHigh(stocks);
    } else {
      logger.info(`⚠️ Nifty 50 (${niftyData.currentPrice}) is below 20 EMA (${niftyData.ema20}). Filtering out all stocks.`);
      filteredStocks = [];
    }
    
    // Save to database
    logger.info('💾 Saving scan results to database...');
    await stockDBService.saveStocks(filteredStocks, niftyData);
    
    // Send email
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