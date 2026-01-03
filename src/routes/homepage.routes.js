// src/routes/homepage.routes.js
/**
 * Homepage Routes
 * Routes for the web interface and API endpoints
 */

const express = require("express");
const healthController = require("../controllers/health.controller");
const scanController = require("../controllers/scan.controller");
const historyController = require("../controllers/history.controller");
const viewController = require("../controllers/view.controller");
const { ensureDbConnection } = require("../middleware/db.middleware");
const { asyncHandler } = require("../middleware/error-handler.middleware");

const router = express.Router();

/**
 * @route GET /
 * @desc Render homepage
 */
router.get("/", viewController.renderHomepage);

/**
 * @route GET /health
 * @desc System health check
 */
router.get("/health", healthController.getHealth);

// ============================================
// Scan Operation Routes
// ============================================

/**
 * @route GET /test-scrape
 * @desc Test stock scraping from Chartink
 */
router.get("/test-scrape", asyncHandler(scanController.testScrape));

/**
 * @route GET /nifty-status
 * @desc Get current Nifty 50 status and EMA
 */
router.get("/nifty-status", asyncHandler(scanController.getNiftyStatus));

/**
 * @route POST /manual-scan
 * @desc Trigger manual stock scan and save to database
 * @access Requires database connection
 */
router.post(
  "/manual-scan",
  ensureDbConnection,
  asyncHandler(scanController.runManualScan)
);

// ============================================
// History Routes (require database)
// ============================================

/**
 * @route GET /scan-history
 * @desc Get list of all scan dates
 * @query {number} limit - Optional limit (default: 30, max: 100)
 * @access Requires database connection
 */
router.get(
  "/scan-history",
  ensureDbConnection,
  asyncHandler(historyController.getScanHistory)
);

/**
 * @route GET /scan-history/:date
 * @desc Get stocks for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @access Requires database connection
 */
router.get(
  "/scan-history/:date",
  ensureDbConnection,
  asyncHandler(historyController.getScanHistoryByDate)
);

/**
 * @route GET /stock-history/:symbol
 * @desc Get history for a specific stock symbol
 * @param {string} symbol - Stock symbol (e.g., RELIANCE)
 * @query {number} limit - Optional limit (default: 10, max: 50)
 * @access Requires database connection
 */
router.get(
  "/stock-history/:symbol",
  ensureDbConnection,
  asyncHandler(historyController.getStockHistoryBySymbol)
);

module.exports = router;
