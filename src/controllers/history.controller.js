// src/controllers/history.controller.js
const StockDBService = require("../services/stock.db.service");
const logger = require("../utils/logger");

class HistoryController {
  constructor() {
    this.stockDBService = null;
    this.getScanHistory = this.getScanHistory.bind(this);
    this.getScanHistoryByDate = this.getScanHistoryByDate.bind(this);
  }

  _ensureService() {
    if (!this.stockDBService) {
      this.stockDBService = new StockDBService();
    }
  }

  async getScanHistory(req, res) {
    try {
      this._ensureService();
      const dates = await this.stockDBService.getAllScanDates(30);
      res.json({
        success: true,
        dates,
      });
    } catch (error) {
      logger.error(`Error fetching scan history: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getScanHistoryByDate(req, res) {
    try {
      this._ensureService();
      const { date } = req.params;
      const stocks = await this.stockDBService.getStocksByDate(date);
      const niftyData = stocks.length > 0 ? stocks[0].niftyData : null;

      res.json({
        success: true,
        stocks,
        niftyData,
        date,
      });
    } catch (error) {
      logger.error(`Error fetching stocks for date: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new HistoryController();
