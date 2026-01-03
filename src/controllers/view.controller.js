// src/controllers/view.controller.js
/**
 * View Controller
 * Handles rendering of web pages
 */

const homepageTemplate = require("../templates/homepage.template");
const logger = require("../utils/logger");

class ViewController {
  constructor() {
    // Bind methods
    this.renderHomepage = this.renderHomepage.bind(this);
  }

  /**
   * Render homepage
   * @route GET /
   */
  renderHomepage(req, res) {
    try {
      const html = homepageTemplate.generate();
      res.send(html);
    } catch (error) {
      logger.error("Failed to render homepage:", error);
      res.status(500).send("Error loading page");
    }
  }
}

// Export singleton instance
module.exports = new ViewController();
