// src/middleware/db.middleware.js
const mongodb = require("../config/mongodb");
const logger = require("../utils/logger");

let connectionPromise = null;

async function ensureDbConnection(req, res, next) {
  try {
    // If there's an existing connection, use it
    if (mongodb.db) {
      return next();
    }

    // If connection is in progress, wait for it
    if (!connectionPromise) {
      logger.info("Establishing database connection...");
      connectionPromise = mongodb.connect();
    }

    await connectionPromise;
    next();
  } catch (error) {
    logger.error("Database connection failed:", error);
    connectionPromise = null; // Reset for retry
    res.status(503).json({
      success: false,
      error: "Database unavailable",
      message: "Please try again later",
      details: error.message,
    });
  }
}

module.exports = { ensureDbConnection };
