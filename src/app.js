// src/app.js
/**
 * Express Application Setup
 * Main application configuration with middleware and routes
 */

const express = require("express");
const path = require("path");
const cron = require("node-cron");
const swaggerUi = require("swagger-ui-express");
const config = require("./config/app.config");
const logger = require("./utils/logger");
const routes = require("./routes");
const swaggerSpecs = require("./config/swagger");
const mongodb = require("./config/mongodb");
const ChartinkScraper = require("./services/scraper.service");
const EmailService = require("./services/email.service");
const MarketDataService = require("./services/market.service");
const StockDBService = require("./services/stock.db.service");
const homepageRoutes = require("./routes/homepage.routes");

// Import error handling middleware
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error-handler.middleware");

const app = express();

// ============================================
// Basic Middleware
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// ============================================
// API Documentation
// ============================================

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

// ============================================
// Application Routes
// ============================================

// Homepage and UI routes
app.use("/", homepageRoutes);

// API routes
app.use("/", routes);

// ============================================
// Error Handling (Must be after all routes)
// ============================================

// 404 handler - catches all undefined routes
app.use(notFoundHandler);

// Global error handler - catches all errors
app.use(errorHandler);

// ============================================
// Service Initialization
// ============================================

const scraper = new ChartinkScraper();
const emailService = new EmailService();
const marketService = new MarketDataService();
const stockDBService = new StockDBService();

// ============================================
// Scheduled Tasks
// ============================================

/**
 * Daily task function for scheduled reports
 */
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

    if (filteredStocks.length > 0) {
      await emailService.sendStockReport(filteredStocks, niftyData);
      logger.info(
        `📧 Email sent for ${filteredStocks.length} shortlisted stock${
          filteredStocks.length === 1 ? "" : "s"
        }.`
      );
    } else {
      logger.info("📭 No shortlisted stocks. Skipping scheduled email.");
    }

    logger.info("✅ Daily task completed successfully");
  } catch (error) {
    logger.error("❌ Daily task failed:", error);
    logger.error(error.stack);
  }
}

/**
 * Setup cron job for evening report
 */
cron.schedule(
  config.scheduler.eveningReport.cronTime,
  async () => {
    logger.info("⏰ Running scheduled evening stock report...");
    await runDailyTask();
  },
  {
    timezone: config.scheduler.eveningReport.timezone,
  }
);

logger.info(
  `📅 Evening report scheduled: ${config.scheduler.eveningReport.cronTime} (${config.scheduler.eveningReport.timezone})`
);
logger.info(`📚 API Documentation: /api-docs`);
logger.info(`🌐 Environment: ${config.app.env}`);

// ============================================
// Graceful Shutdown
// ============================================

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing MongoDB connection...");
  try {
    await mongodb.disconnect();
    logger.info("MongoDB connection closed");
  } catch (error) {
    logger.error("Error closing MongoDB:", error);
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing MongoDB connection...");
  try {
    await mongodb.disconnect();
    logger.info("MongoDB connection closed");
  } catch (error) {
    logger.error("Error closing MongoDB:", error);
  }
  process.exit(0);
});

// ============================================
// Exports
// ============================================

module.exports = app;
module.exports.runDailyTask = runDailyTask;
