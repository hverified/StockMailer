// src/routes/homepage.routes.js
const express = require("express");
const healthController = require("../controllers/health.controller");
const scanController = require("../controllers/scan.controller");
const historyController = require("../controllers/history.controller");
const viewController = require("../controllers/view.controller");
const { ensureDbConnection } = require("../middleware/db.middleware");

const router = express.Router();

// Homepage View (no DB needed)
router.get("/", viewController.renderHomepage);

// Health Check (no DB needed)
router.get("/health", healthController.getHealth);

// Scan Operations (require DB)
router.get("/test-scrape", scanController.testScrape);
router.get("/nifty-status", scanController.getNiftyStatus);
router.post("/manual-scan", ensureDbConnection, scanController.runManualScan);

// History Operations (require DB) - ADD MIDDLEWARE HERE
router.get(
  "/scan-history",
  ensureDbConnection,
  historyController.getScanHistory
);
router.get(
  "/scan-history/:date",
  ensureDbConnection,
  historyController.getScanHistoryByDate
);

module.exports = router;
