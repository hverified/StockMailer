// api/cron.js
// Vercel serverless function for cron job

/**
 * @swagger
 * /api/cron:
 *   get:
 *     summary: Scheduled cron job endpoint
 *     description: This endpoint is called by Vercel Cron to run the daily stock report task. It checks Nifty 50 EMA, scrapes stocks, and sends email report.
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cron job executed successfully
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
 *                 stocksIncluded:
 *                   type: integer
 *                   example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing CRON_SECRET
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       405:
 *         description: Method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Method not allowed
 *       500:
 *         description: Error executing cron job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

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