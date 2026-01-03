require("dotenv").config();
const app = require("./src/app");
const mongodb = require("./src/config/mongodb");
const logger = require("./src/utils/logger");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to MongoDB before starting server
    logger.info("Connecting to MongoDB...");
    await mongodb.connect();
    logger.info("✅ MongoDB connected successfully");

    // Start the server
    app.listen(PORT, () => {
      logger.info("=".repeat(60));
      logger.info("🚀 PRODUCTION STOCK SCRAPER STARTED");
      logger.info("=".repeat(60));
      logger.info(`📡 Server: http://localhost:${PORT}`);
      logger.info(`⏰ Schedule: ${process.env.CRON_TIME || "0 17 * * *"}`);
      logger.info(`🕐 Timezone: ${process.env.TIMEZONE || "Asia/Kolkata"}`);
      logger.info("=".repeat(60));
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("\n⏹️  Shutting down gracefully...");
  await mongodb.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing connections...");
  await mongodb.disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the server
startServer();
