// src/controllers/history.controller.js
/**
 * History Controller
 * Handles historical scan data retrieval
 */

const StockDBService = require("../services/stock.db.service");
const logger = require("../utils/logger");
const DateUtil = require("../utils/date.util");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/error-handler.middleware");

class HistoryController {
  constructor() {
    this.stockDBService = null;

    // Bind methods
    this.getScanHistory = this.getScanHistory.bind(this);
    this.getScanHistoryByDate = this.getScanHistoryByDate.bind(this);
    this.updateStockOutcome = this.updateStockOutcome.bind(this);
    this.getDateOutcomeReport = this.getDateOutcomeReport.bind(this);
    this.getAggregateOutcomeReport = this.getAggregateOutcomeReport.bind(this);
  }

  /**
   * Initialize service if not already initialized
   * @private
   */
  _ensureService() {
    if (!this.stockDBService) {
      this.stockDBService = new StockDBService();
    }
  }

  /**
   * Get list of all scan dates with metadata
   * @route GET /scan-history
   * @query {number} limit - Maximum number of dates to return (default: 30)
   */
  async getScanHistory(req, res) {
    try {
      this._ensureService();

      const limit = parseInt(req.query.limit) || 30;

      if (limit < 1 || limit > 100) {
        throw new ValidationError("Limit must be between 1 and 100");
      }

      logger.info(`Fetching scan history (limit: ${limit})`);
      const dates = await this.stockDBService.getAllScanDates(limit);

      res.json({
        success: true,
        count: dates.length,
        dates: dates,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error fetching scan history:", error);
      throw error;
    }
  }

  /**
   * Get stocks for a specific date
   * @route GET /scan-history/:date
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async getScanHistoryByDate(req, res) {
    try {
      this._ensureService();

      const { date } = req.params;

      // Validate date format
      if (!DateUtil.isValidDateFormat(date)) {
        throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
      }

      logger.info(`Fetching stocks for date: ${date}`);
      const stocks = await this.stockDBService.getStocksByDate(date);

      if (!stocks || stocks.length === 0) {
        return res.json({
          success: true,
          message: "No stocks found for this date",
          stocks: [],
          niftyData: null,
          date: date,
          timestamp: new Date().toISOString(),
        });
      }

      // Extract Nifty data from first stock (all stocks on same date have same Nifty data)
      const niftyData = stocks[0].niftyData || null;

      res.json({
        success: true,
        count: stocks.length,
        stocks: stocks,
        niftyData: niftyData,
        date: date,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`Error fetching stocks for date ${req.params.date}:`, error);
      throw error;
    }
  }

  /**
   * Get stock history by symbol
   * @route GET /stock-history/:symbol
   * @param {string} symbol - Stock symbol
   * @query {number} limit - Number of records (default: 10)
   */
  async getStockHistoryBySymbol(req, res) {
    try {
      this._ensureService();

      const { symbol } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      if (!symbol) {
        throw new ValidationError("Stock symbol is required");
      }

      if (limit < 1 || limit > 50) {
        throw new ValidationError("Limit must be between 1 and 50");
      }

      logger.info(`Fetching history for symbol: ${symbol} (limit: ${limit})`);
      const history = await this.stockDBService.getStockHistory(
        symbol.toUpperCase(),
        limit
      );

      if (!history || history.length === 0) {
        return res.json({
          success: true,
          message: `No history found for ${symbol}`,
          symbol: symbol.toUpperCase(),
          history: [],
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        symbol: symbol.toUpperCase(),
        count: history.length,
        history: history,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(
        `Error fetching history for symbol ${req.params.symbol}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update triggered/profitability outcome for a stock on a date
   * @route PATCH /scan-history/:date/stocks/:symbol/outcome
   */
  async updateStockOutcome(req, res) {
    try {
      this._ensureService();

      const { date, symbol } = req.params;
      const { triggeredStatus, pnlStatus } = req.body || {};

      if (!DateUtil.isValidDateFormat(date)) {
        throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
      }

      if (!symbol) {
        throw new ValidationError("Stock symbol is required");
      }

      const allowedTriggered = ["triggered", "not_triggered", "unmarked"];
      const allowedPnl = ["profit", "loss", "unmarked"];

      if (
        triggeredStatus !== undefined &&
        !allowedTriggered.includes(triggeredStatus)
      ) {
        throw new ValidationError(
          "triggeredStatus must be one of: triggered, not_triggered, unmarked"
        );
      }

      if (pnlStatus !== undefined && !allowedPnl.includes(pnlStatus)) {
        throw new ValidationError(
          "pnlStatus must be one of: profit, loss, unmarked"
        );
      }

      if (triggeredStatus === undefined && pnlStatus === undefined) {
        throw new ValidationError(
          "At least one field is required: triggeredStatus or pnlStatus"
        );
      }

      const updated = await this.stockDBService.updateStockOutcome(
        symbol.toUpperCase(),
        date,
        { triggeredStatus, pnlStatus }
      );

      if (!updated) {
        throw new NotFoundError(
          `Stock ${symbol.toUpperCase()} not found for date ${date}`
        );
      }

      const report = await this.stockDBService.getDateOutcomeReport(date);

      res.json({
        success: true,
        message: "Stock outcome updated successfully",
        date,
        symbol: symbol.toUpperCase(),
        stock: updated,
        report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(
        `Error updating outcome for ${req.params.symbol} on ${req.params.date}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get outcome report for a date
   * @route GET /scan-history/:date/report
   */
  async getDateOutcomeReport(req, res) {
    try {
      this._ensureService();

      const { date } = req.params;

      if (!DateUtil.isValidDateFormat(date)) {
        throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
      }

      const report = await this.stockDBService.getDateOutcomeReport(date);

      res.json({
        success: true,
        report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(
        `Error fetching outcome report for ${req.params.date}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get aggregate stock outcome report
   * @route GET /stocks-report
   * @query {number} limit - Number of recent date rows (default 30, max 100)
   */
  async getAggregateOutcomeReport(req, res) {
    try {
      this._ensureService();

      const limit = parseInt(req.query.limit) || 30;

      if (limit < 1 || limit > 100) {
        throw new ValidationError("Limit must be between 1 and 100");
      }

      const report = await this.stockDBService.getAggregateOutcomeReport(limit);

      res.json({
        success: true,
        report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error fetching aggregate stocks report:", error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new HistoryController();
