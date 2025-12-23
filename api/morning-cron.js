// api/morning-cron.js
// Vercel serverless function for morning pre-market cron job

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
    logger.warn('Unauthorized morning cron request attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logger.info('🌅 Starting morning pre-market cron job...');
    
    // Initialize services
    const emailService = new EmailService();
    const yahooFinance = new YahooFinanceService();
    const storage = new StorageService();
    
    // Step 1: Load stocks from saved file
    logger.info('📂 Loading stocks from saved file...');
    const savedData = await storage.loadStocks();
    
    if (!savedData || !savedData.stocks || savedData.stocks.length === 0) {
      logger.info('⏭️ No stocks found in saved file - skipping morning report');
      return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        message: 'No stocks found - morning report skipped',
        stocksProcessed: 0,
        emailSent: false
      });
    }
    
    const stocks = savedData.stocks;
    const niftyData = savedData.niftyData;
    
    logger.info(`Found ${stocks.length} stocks from previous evening`);
    
    // Step 2: Enrich stocks with current and previous day high data
    logger.info('💰 Enriching stocks with high data...');
    const enrichedStocks = await yahooFinance.enrichStocksWithDayAndPrevHighs(stocks);
    
    // Step 3: Send morning email ONLY if stocks exist
    if (enrichedStocks.length > 0) {
      await emailService.sendMorningStockReport(enrichedStocks, niftyData);
      logger.info(`✅ Morning report sent with ${enrichedStocks.length} stocks`);
    } else {
      logger.info('⏭️ No stocks to process - skipping email');
    }
    
    logger.info('✅ Morning cron job completed successfully');
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      niftyData: {
        currentPrice: niftyData.currentPrice,
        ema20: niftyData.ema20,
        isAboveEMA: niftyData.isAboveEMA
      },
      stocksProcessed: enrichedStocks.length,
      emailSent: enrichedStocks.length > 0
    });
  } catch (error) {
    logger.error(`❌ Morning cron job failed: ${error.message}`);
    logger.error(error.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};