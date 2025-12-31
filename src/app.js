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

// Daily task function
async function runDailyTask() {
  try {
    logger.info('🚀 Starting daily task...');
    
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
  } catch (error) {
    logger.error(`❌ Daily task failed: ${error.message}`);
    logger.error(error.stack);
  }
}

// Setup scheduler
cron.schedule(config.scheduler.cronTime, async () => {
  logger.info('⏰ Running scheduled daily stock report task...');
  await runDailyTask();
}, {
  timezone: config.scheduler.timezone
});

logger.info(`📅 Scheduler configured: ${config.scheduler.cronTime} (${config.scheduler.timezone})`);
logger.info(`📚 API Documentation available at: /api-docs`);

// Export the runDailyTask function for Vercel cron
module.exports = app;
module.exports.runDailyTask = runDailyTask;