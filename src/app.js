// src/app.js
const express = require("express");
const path = require("path");
const cron = require("node-cron");
const swaggerUi = require("swagger-ui-express");
const config = require("./config");
const logger = require("./utils/logger");
const helpers = require("./utils/helpers");
const routes = require("./routes");
const swaggerSpecs = require("./config/swagger");
const mongodb = require("./config/mongodb");
const ChartinkScraper = require("./services/scraper.service");
const EmailService = require("./services/email.service");
const MarketDataService = require("./services/market.service");
const StockDBService = require("./services/stock.db.service");
const homepageRoutes = require("./routes/homepage.routes");

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});
app.use(express.static(path.join(__dirname, "..", "public")));

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customSiteTitle: "Stock Mailer API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  })
);

// Routes
app.use("/", homepageRoutes);
app.use("/", routes);

// Validate configuration
if (!helpers.validateConfig()) {
  logger.error("Configuration validation failed. Exiting...");
  process.exit(1);
}

// Initialize services
const scraper = new ChartinkScraper();
const emailService = new EmailService();
const marketService = new MarketDataService();
const stockDBService = new StockDBService();

// Daily task function
async function runDailyTask() {
  try {
    logger.info("🚀 Starting daily task...");

    // Ensure DB connection
    if (!mongodb.db) {
      await mongodb.connect();
    }

    const niftyData = await marketService.getNifty50Data();

    let stocks = [];
    let filteredStocks = [];

    logger.info("🔍 Scraping stocks from Chartink...");
    stocks = await scraper.scrapeStocks();

    if (niftyData.isAboveEMA) {
      logger.info(
        `✅ Nifty 50 (${niftyData.currentPrice}) is above 20 EMA (${niftyData.ema20}). Including all stocks.`
      );
      filteredStocks = await marketService.enrichStocksWithDayHigh(stocks);
    } else {
      logger.info(
        `⚠️ Nifty 50 (${niftyData.currentPrice}) is below 20 EMA (${niftyData.ema20}). Filtering out all stocks.`
      );
      filteredStocks = [];
    }

    // Save to database
    try {
      logger.info("💾 Saving scan results to database...");
      await stockDBService.saveStocks(filteredStocks, niftyData);
    } catch (dbError) {
      logger.error(`Database save failed: ${dbError.message}`);
      // Continue even if database save fails
    }

    await emailService.sendStockReport(filteredStocks, niftyData);

    logger.info("✅ Daily task completed successfully");
  } catch (error) {
    logger.error(`❌ Daily task failed: ${error.message}`);
    logger.error(error.stack);
  }
}

// Setup scheduler
cron.schedule(
  config.scheduler.cronTime,
  async () => {
    logger.info("⏰ Running scheduled daily stock report task...");
    await runDailyTask();
  },
  {
    timezone: config.scheduler.timezone,
  }
);

logger.info(
  `📅 Scheduler configured: ${config.scheduler.cronTime} (${config.scheduler.timezone})`
);
logger.info(`📚 API Documentation available at: /api-docs`);

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing MongoDB connection...");
  await mongodb.disconnect();
  process.exit(0);
});

module.exports = app;
module.exports.runDailyTask = runDailyTask;
