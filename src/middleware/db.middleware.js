// src/middleware/db.middleware.js
const mongodb = require("../config/mongodb");
const logger = require("../utils/logger");

let isConnected = false;

async function ensureDbConnection(req, res, next) {
  if (isConnected) {
    return next();
  }

  try {
    await mongodb.connect();
    isConnected = true;
    next();
  } catch (error) {
    logger.error("Database connection failed:", error);
    res.status(503).json({
      success: false,
      error: "Database unavailable",
      message: "Please try again later",
    });
  }
}

module.exports = { ensureDbConnection };
