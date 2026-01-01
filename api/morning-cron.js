// api/morning-cron.js
// Vercel serverless function for morning pre-market cron job

/**
 * @swagger
 * /api/morning-cron:
 *   get:
 *     summary: Morning pre-market cron job endpoint
 *     description: This endpoint is called by Vercel Cron at 9:29 AM IST to run the morning stock report. It scrapes stocks, fetches current and previous day highs, and sends email report.
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Morning cron job executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 niftyData:
 *                   type: object
 *                   properties:
 *                     currentPrice:
 *                       type: number
 *                       example: 19850.25
 *                     ema20:
 *                       type: number
 *                       example: 19500.00
 *                     isAboveEMA:
 *                       type: boolean
 *                       example: true
 *                 stocksScraped:
 *                   type: integer
 *                   example: 25
 *                 stocksProcessed:
 *                   type: integer
 *                   example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing CRON_SECRET
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Error executing morning cron job
 */

const ChartinkScraper = require('../src/services/scraper.service');
const EmailService = require('../src/services/email.service');
const MarketDataService = require('../src/services/market.service');
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
    const scraper = new ChartinkScraper();
    const emailService = new EmailService();
    const marketService = new MarketDataService();
    
    // Step 1: Get Nifty 50 data and check if above EMA
    logger.info('📊 Checking Nifty 50 EMA condition...');
    const niftyData = await marketService.getNifty50Data();
    
    // Step 2: Scrape stocks from Chartink
    logger.info('🔍 Scraping stocks from Chartink...');
    const stocks = await scraper.scrapeStocks();
    
    // Step 3: Enrich stocks with current and previous day high data
    logger.info('💰 Enriching stocks with high data...');
    const enrichedStocks = await marketService.enrichStocksWithDayAndPrevHighs(stocks);
    
    // Step 4: Send morning email report
    await emailService.sendMorningStockReport(enrichedStocks, niftyData);
    
    logger.info('✅ Morning cron job completed successfully');
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      niftyData: {
        currentPrice: niftyData.currentPrice,
        ema20: niftyData.ema20,
        isAboveEMA: niftyData.isAboveEMA
      },
      stocksScraped: stocks.length,
      stocksProcessed: enrichedStocks.length
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