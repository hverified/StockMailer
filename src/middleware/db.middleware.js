// src/middleware/db.middleware.js
/**
 * Database Connection Middleware
 * Ensures database connection is established before handling requests
 */

const mongodb = require("../config/mongodb");
const logger = require("../utils/logger");
const { DatabaseError } = require("./error-handler.middleware");

let connectionPromise = null;
let isConnecting = false;

/**
 * Middleware to ensure database connection
 * Connects to database if not already connected
 * Handles concurrent connection attempts
 */
async function ensureDbConnection(req, res, next) {
  try {
    // If already connected, proceed
    if (mongodb.db) {
      return next();
    }

    // If connection is in progress, wait for it
    if (isConnecting && connectionPromise) {
      logger.debug("Connection in progress, waiting...");
      await connectionPromise;
      return next();
    }

    // Start new connection
    logger.info("Establishing database connection...");
    isConnecting = true;
    connectionPromise = mongodb.connect();

    await connectionPromise;

    isConnecting = false;
    logger.info("Database connection established");
    next();
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;

    logger.error("Database connection failed:", error);

    // Return proper error response
    res.status(503).json({
      success: false,
      error: "Database unavailable",
      message: "Please try again later",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Optional: Middleware to check if DB is connected (lighter version)
 * Use this for endpoints that don't strictly require DB but benefit from it
 */
function checkDbConnection(req, res, next) {
  if (!mongodb.db) {
    logger.warn("Database not connected for optional endpoint");
    req.dbAvailable = false;
  } else {
    req.dbAvailable = true;
  }
  next();
}

module.exports = {
  ensureDbConnection,
  checkDbConnection,
};
