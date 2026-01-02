// src/controllers/health.controller.js
const logger = require("../utils/logger");

class HealthController {
  getHealth(req, res) {
    try {
      res.json({
        status: "UP",
        uptime: process.uptime(),
        memory: process.memoryUsage().rss,
      });
    } catch (error) {
      logger.error(`Health check failed: ${error.message}`);
      res.status(500).json({
        status: "ERROR",
        error: error.message,
      });
    }
  }
}

module.exports = new HealthController();
