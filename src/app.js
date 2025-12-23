const express = require('express');
const cron = require('node-cron');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const logger = require('./utils/logger');
const helpers = require('./utils/helpers');
const routes = require('./routes');
const swaggerSpecs = require('./config/swagger');
const ChartinkScraper = require('./services/scraper.service');
const EmailService = require('./services/email.service');
const YahooFinanceService = require('./services/yahoo.service');
const StorageService = require('./services/storage.service');

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customSiteTitle: 'Stock Mailer API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
}));

// Routes
app.use('/', routes);

// Validate configuration
if (!helpers.validateConfig()) {
  logger.error('Configuration validation failed. Exiting...');
  process.exit(1);
}

// Initialize services
const scraper = new ChartinkScraper();
const emailService = new EmailService();
const yahooFinance = new YahooFinanceService();
const storage = new StorageService();

// Evening task function
async function runEveningTask() {
  try {
    logger.info('🚀 Starting evening task...');
    
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
    
    // Step 4: Save stocks to file
    await storage.saveStocks(filteredStocks, niftyData);
    
    // Step 5: Send email ONLY if stocks found
    if (filteredStocks.length > 0) {
      await emailService.sendStockReport(filteredStocks, niftyData);
      logger.info(`✅ Evening report sent with ${filteredStocks.length} stocks`);
    } else {
      logger.info('⏭️ No stocks found - skipping email');
    }
    
    logger.info('✅ Evening task completed successfully');
  } catch (error) {
    logger.error(`❌ Evening task failed: ${error.message}`);
    logger.error(error.stack);
  }
}

// Morning task function
async function runMorningTask() {
  try {
    logger.info('🌅 Starting morning task...');
    
    // Load stocks from saved file
    logger.info('📂 Loading stocks from saved file...');
    const savedData = await storage.loadStocks();
    
    if (!savedData || !savedData.stocks || savedData.stocks.length === 0) {
      logger.info('⏭️ No stocks found in saved file - skipping morning report');
      return;
    }
    
    const stocks = savedData.stocks;
    const niftyData = savedData.niftyData;
    
    logger.info(`Found ${stocks.length} stocks from previous evening`);
    
    // Enrich stocks with current and previous day highs
    logger.info('💰 Enriching stocks with high data...');
    const enrichedStocks = await yahooFinance.enrichStocksWithDayAndPrevHighs(stocks);
    
    // Send morning email ONLY if stocks exist
    if (enrichedStocks.length > 0) {
      await emailService.sendMorningStockReport(enrichedStocks, niftyData);
      logger.info(`✅ Morning report sent with ${enrichedStocks.length} stocks`);
    } else {
      logger.info('⏭️ No stocks to process - skipping email');
    }
    
    logger.info('✅ Morning task completed successfully');
  } catch (error) {
    logger.error(`❌ Morning task failed: ${error.message}`);
    logger.error(error.stack);
  }
}

// Setup schedulers
// Evening report: 5:00 PM IST (Mon-Fri)
cron.schedule(config.scheduler.cronTime, async () => {
  logger.info('⏰ Running scheduled evening stock report task...');
  await runEveningTask();
}, {
  timezone: config.scheduler.timezone
});

// Morning report: 9:29 AM IST (Mon-Fri)
cron.schedule('29 9 * * 1-5', async () => {
  logger.info('⏰ Running scheduled morning stock report task...');
  await runMorningTask();
}, {
  timezone: config.scheduler.timezone
});

logger.info(`📅 Evening scheduler: ${config.scheduler.cronTime} (${config.scheduler.timezone})`);
logger.info(`📅 Morning scheduler: 9:29 AM (${config.scheduler.timezone})`);
logger.info(`📚 API Documentation available at: /api-docs`);

// Export functions for Vercel cron
module.exports = app;
module.exports.runEveningTask = runEveningTask;
module.exports.runMorningTask = runMorningTask;