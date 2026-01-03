// src/controllers/health.controller.js
/**
 * Health Controller
 * Handles system health check endpoints
 */

const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/error-handler.middleware");
const FormatUtil = require("../utils/format.util");

class HealthController {
  constructor() {
    // Bind methods to maintain context
    this.getHealth = this.getHealth.bind(this);
  }

  /**
   * Get system health status
   * @route GET /health
   */
  getHealth(req, res) {
    try {
      const uptimeSeconds = process.uptime();
      const memoryBytes = process.memoryUsage().rss;

      res.json({
        status: "UP",
        uptime: uptimeSeconds,
        memory: memoryBytes,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      logger.error("Health check failed:", error);
      res.status(500).json({
        status: "ERROR",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export singleton instance
module.exports = new HealthController();
