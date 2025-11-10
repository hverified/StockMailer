const express = require('express');
const cron = require('node-cron');
const config = require('./config');
const logger = require('./utils/logger');
const helpers = require('./utils/helpers');
const routes = require('./routes');
const ChartinkScraper = require('./services/scraper.service');
const EmailService = require('./services/email.service');

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

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

// Daily task function
async function runDailyTask() {
  try {
    logger.info('🚀 Starting daily task...');
    
    // Scrape stocks
    const stocks = await scraper.scrapeStocks();
    
    // Send email report
    await emailService.sendStockReport(stocks);
    
    logger.info('✅ Daily task completed successfully');
  } catch (error) {
    logger.error(`❌ Daily task failed: ${error.message}`);
  }
}

// Setup scheduler
cron.schedule(config.scheduler.cronTime, async () => {
  logger.info('⏰ Running scheduled daily stock report task...');
  await runDailyTask();
}, {
  // timezone: config.scheduler.timezone
});

logger.info(`📅 Scheduler configured: ${config.scheduler.cronTime} (${config.scheduler.timezone})`);

module.exports = app;