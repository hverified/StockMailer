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
const authController = require("../controllers/auth.controller");
const { ensureDbConnection } = require("../middleware/db.middleware");
const { asyncHandler } = require("../middleware/error-handler.middleware");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @route GET /
 * @desc Render homepage
 */
router.get("/", viewController.renderHomepage);

// ============================================
// Auth Routes
// ============================================

router.post(
  "/auth/signup",
  ensureDbConnection,
  asyncHandler(authController.signUp)
);

router.post(
  "/auth/signin",
  ensureDbConnection,
  asyncHandler(authController.signIn)
);

router.post(
  "/auth/signout",
  ensureDbConnection,
  asyncHandler(authController.signOut)
);

router.get(
  "/auth/me",
  ensureDbConnection,
  asyncHandler(authController.me)
);

router.post(
  "/auth/forgot-password",
  ensureDbConnection,
  asyncHandler(authController.forgotPassword)
);

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
router.get(
  "/test-scrape",
  requireAuth,
  asyncHandler(scanController.testScrape)
);

/**
 * @route GET /nifty-status
 * @desc Get current Nifty 50 status and EMA
 * @access Requires database connection
 */
router.get(
  "/nifty-status",
  ensureDbConnection,
  requireAuth,
  asyncHandler(scanController.getNiftyStatus)
);

/**
 * @route POST /manual-scan
 * @desc Trigger manual stock scan and save to database
 * @access Requires database connection
 */
router.post(
  "/manual-scan",
  ensureDbConnection,
  requireAuth,
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
  requireAuth,
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
  requireAuth,
  asyncHandler(historyController.getScanHistoryByDate)
);

/**
 * @route GET /scan-history/:date/report
 * @desc Get stock outcome report for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @access Requires database connection
 */
router.get(
  "/scan-history/:date/report",
  ensureDbConnection,
  requireAuth,
  asyncHandler(historyController.getDateOutcomeReport)
);

/**
 * @route PATCH /scan-history/:date/stocks/:symbol/outcome
 * @desc Update triggered/profitability outcome for a stock
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} symbol - Stock symbol
 * @access Requires database connection
 */
router.patch(
  "/scan-history/:date/stocks/:symbol/outcome",
  ensureDbConnection,
  requireAuth,
  asyncHandler(historyController.updateStockOutcome)
);

/**
 * @route GET /stocks-report
 * @desc Get aggregated stock outcome report across scans
 * @query {number} limit - Number of recent date rows (default 30, max 100)
 * @access Requires database connection
 */
router.get(
  "/stocks-report",
  ensureDbConnection,
  requireAuth,
  asyncHandler(historyController.getAggregateOutcomeReport)
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
  requireAuth,
  asyncHandler(historyController.getStockHistoryBySymbol)
);

module.exports = router;
