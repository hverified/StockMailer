// src/routes/homepage.routes.js
const express = require("express");
const healthController = require("../controllers/health.controller");
const scanController = require("../controllers/scan.controller");
const historyController = require("../controllers/history.controller");
const viewController = require("../controllers/view.controller");

const router = express.Router();

// Homepage View
router.get("/", viewController.renderHomepage);

// Health Check
router.get("/health", healthController.getHealth);

// Scan Operations
router.get("/test-scrape", scanController.testScrape);
router.get("/nifty-status", scanController.getNiftyStatus);
router.post("/manual-scan", scanController.runManualScan);

// History Operations
router.get("/scan-history", historyController.getScanHistory);
router.get("/scan-history/:date", historyController.getScanHistoryByDate);

module.exports = router;
