// src/services/repositories/stock.repository.js
/**
 * Stock Repository
 * Data access layer for stock operations
 * Implements Repository Pattern for database abstraction
 */

const logger = require("../../utils/logger");
const DateUtil = require("../../utils/date.util");
const { DatabaseError } = require("../../middleware/error-handler.middleware");

class StockRepository {
  constructor(database) {
    this.db = database;
    this.collectionName = "stocks";
  }

  /**
   * Get collection instance
   * @private
   */
  _getCollection() {
    if (!this.db) {
      throw new DatabaseError("Database connection not initialized");
    }
    return this.db.collection(this.collectionName);
  }

  /**
   * Save multiple stocks with bulk write
   * @param {Array} stocks - Array of stock objects
   * @param {Object} niftyData - Nifty 50 market data
   * @returns {Promise<Object>} Bulk write result
   */
  async bulkSave(stocks, niftyData) {
    try {
      if (!stocks || stocks.length === 0) {
        logger.info("No stocks to save");
        return { upsertedCount: 0, modifiedCount: 0 };
      }

      const currentDate = DateUtil.getCurrentDate();
      const timestamp = new Date();

      const operations = stocks.map((stock) => {
        // Ensure scannedDate is set
        const scannedDate =
          stock.scannedDate || stock.shortlisted_date || currentDate;

        return {
          updateOne: {
            filter: {
              symbol: stock.symbol,
              scannedDate: scannedDate,
            },
            update: {
              $set: {
                ...stock,
                scannedDate: scannedDate, // Ensure it's always set
                timestamp: timestamp,
                niftyData: {
                  currentPrice: niftyData.currentPrice,
                  ema20: niftyData.ema20,
                  isAboveEMA: niftyData.isAboveEMA,
                },
                updatedAt: timestamp,
              },
              $setOnInsert: {
                createdAt: timestamp,
                triggeredStatus: "unmarked",
                pnlStatus: "unmarked",
              },
            },
            upsert: true,
          },
        };
      });

      const result = await this._getCollection().bulkWrite(operations);

      logger.info(
        `Saved ${
          result.upsertedCount + result.modifiedCount
        } stocks to database for date: ${currentDate}`
      );

      return result;
    } catch (error) {
      logger.error("Failed to save stocks:", error);
      throw new DatabaseError(`Failed to save stocks: ${error.message}`);
    }
  }

  /**
   * Find stocks by date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of stocks
   */
  async findByDate(date) {
    try {
      const stocks = await this._getCollection()
        .find({ scannedDate: date })
        .sort({ timestamp: -1 })
        .toArray();

      logger.debug(`Found ${stocks.length} stocks for date ${date}`);

      return stocks;
    } catch (error) {
      logger.error(`Failed to fetch stocks for date ${date}:`, error);
      throw new DatabaseError(`Failed to fetch stocks: ${error.message}`);
    }
  }

  /**
   * Find stock by symbol and date
   * @param {string} symbol - Stock symbol
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object|null>} Stock object or null
   */
  async findBySymbolAndDate(symbol, date) {
    try {
      return await this._getCollection().findOne({
        symbol: symbol.toUpperCase(),
        scannedDate: date,
      });
    } catch (error) {
      logger.error(`Failed to fetch stock ${symbol} for ${date}:`, error);
      throw new DatabaseError(`Failed to fetch stock: ${error.message}`);
    }
  }

  /**
   * Get all unique scan dates with metadata
   * @param {number} limit - Maximum number of dates to return
   * @returns {Promise<Array>} Array of date objects with counts
   */
  async getScanDates(limit = 30) {
    try {
      const dates = await this._getCollection()
        .aggregate([
          {
            // Filter out documents with null or missing scannedDate
            $match: {
              scannedDate: { $ne: null, $exists: true },
            },
          },
          {
            $group: {
              _id: "$scannedDate",
              count: { $sum: 1 },
              timestamp: { $first: "$timestamp" },
              niftyData: { $first: "$niftyData" },
              triggeredCount: {
                $sum: {
                  $cond: [{ $eq: ["$triggeredStatus", "triggered"] }, 1, 0],
                },
              },
              notTriggeredCount: {
                $sum: {
                  $cond: [{ $eq: ["$triggeredStatus", "not_triggered"] }, 1, 0],
                },
              },
              profitCount: {
                $sum: {
                  $cond: [{ $eq: ["$pnlStatus", "profit"] }, 1, 0],
                },
              },
              lossCount: {
                $sum: {
                  $cond: [{ $eq: ["$pnlStatus", "loss"] }, 1, 0],
                },
              },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: limit },
        ])
        .toArray();

      const formatted = dates.map((d) => ({
        date: d._id,
        count: d.count,
        timestamp: d.timestamp,
        niftyData: d.niftyData,
        triggeredCount: d.triggeredCount || 0,
        notTriggeredCount: d.notTriggeredCount || 0,
        profitCount: d.profitCount || 0,
        lossCount: d.lossCount || 0,
      }));

      logger.debug(`Retrieved ${formatted.length} scan dates`);

      return formatted;
    } catch (error) {
      logger.error("Failed to fetch scan dates:", error);
      throw new DatabaseError(`Failed to fetch scan dates: ${error.message}`);
    }
  }

  /**
   * Get stock history by symbol
   * @param {string} symbol - Stock symbol
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Stock history
   */
  async getStockHistory(symbol, limit = 10) {
    try {
      const history = await this._getCollection()
        .find({
          symbol: symbol.toUpperCase(),
          scannedDate: { $ne: null, $exists: true }, // Filter out null dates
        })
        .sort({ scannedDate: -1 })
        .limit(limit)
        .toArray();

      logger.debug(`Retrieved ${history.length} records for ${symbol}`);

      return history;
    } catch (error) {
      logger.error(`Failed to fetch history for ${symbol}:`, error);
      throw new DatabaseError(
        `Failed to fetch stock history: ${error.message}`
      );
    }
  }

  /**
   * Get statistics for a date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Statistics object
   */
  async getDateStatistics(date) {
    try {
      const stats = await this._getCollection()
        .aggregate([
          { $match: { scannedDate: date } },
          {
            $group: {
              _id: null,
              totalStocks: { $sum: 1 },
              avgChange: { $avg: "$per_chg" },
              maxChange: { $max: "$per_chg" },
              minChange: { $min: "$per_chg" },
              totalVolume: { $sum: "$volume" },
            },
          },
        ])
        .toArray();

      return (
        stats[0] || {
          totalStocks: 0,
          avgChange: 0,
          maxChange: 0,
          minChange: 0,
          totalVolume: 0,
        }
      );
    } catch (error) {
      logger.error(`Failed to get statistics for ${date}:`, error);
      throw new DatabaseError(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Delete scans older than specified days
   * @param {number} daysToKeep - Number of days to retain
   * @returns {Promise<number>} Number of deleted documents
   */
  async deleteOlderThan(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this._getCollection().deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      logger.info(`Deleted ${result.deletedCount} old stock records`);

      return result.deletedCount;
    } catch (error) {
      logger.error("Failed to delete old stocks:", error);
      throw new DatabaseError(`Failed to delete old stocks: ${error.message}`);
    }
  }

  /**
   * Fix null scannedDate records
   * Updates all records with null scannedDate to use their timestamp date
   * @returns {Promise<number>} Number of fixed documents
   */
  async fixNullScannedDates() {
    try {
      // Find all documents with null or missing scannedDate
      const nullDateDocs = await this._getCollection()
        .find({
          $or: [{ scannedDate: null }, { scannedDate: { $exists: false } }],
        })
        .toArray();

      if (nullDateDocs.length === 0) {
        logger.info("No null scannedDate records found");
        return 0;
      }

      logger.info(`Found ${nullDateDocs.length} records with null scannedDate`);

      const operations = nullDateDocs.map((doc) => {
        // Try to derive date from timestamp, shortlisted_date, or use current date
        let derivedDate;

        if (doc.timestamp) {
          derivedDate = new Date(doc.timestamp).toISOString().split("T")[0];
        } else if (doc.shortlisted_date) {
          derivedDate = doc.shortlisted_date;
        } else {
          derivedDate = DateUtil.getCurrentDate();
        }

        return {
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                scannedDate: derivedDate,
                timestamp: doc.timestamp || new Date(),
              },
            },
          },
        };
      });

      const result = await this._getCollection().bulkWrite(operations);

      logger.info(
        `Fixed ${result.modifiedCount} records with null scannedDate`
      );

      return result.modifiedCount;
    } catch (error) {
      logger.error("Failed to fix null scannedDate records:", error);
      throw new DatabaseError(`Failed to fix null dates: ${error.message}`);
    }
  }

  /**
   * Count total stocks in database
   * @returns {Promise<number>} Total count
   */
  async count() {
    try {
      return await this._getCollection().countDocuments();
    } catch (error) {
      logger.error("Failed to count stocks:", error);
      throw new DatabaseError(`Failed to count stocks: ${error.message}`);
    }
  }

  /**
   * Get latest scan date
   * @returns {Promise<string|null>} Latest date or null
   */
  async getLatestScanDate() {
    try {
      const latest = await this._getCollection()
        .find({ scannedDate: { $ne: null, $exists: true } })
        .sort({ scannedDate: -1 })
        .limit(1)
        .toArray();

      return latest[0]?.scannedDate || null;
    } catch (error) {
      logger.error("Failed to get latest scan date:", error);
      throw new DatabaseError(
        `Failed to get latest scan date: ${error.message}`
      );
    }
  }

  /**
   * Update stock trade outcome for a given date
   * @param {string} symbol - Stock symbol
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {Object} outcome - Outcome payload
   * @returns {Promise<Object>} Updated stock document
   */
  async updateOutcomeBySymbolAndDate(symbol, date, outcome = {}) {
    try {
      const validTriggered = ["triggered", "not_triggered", "unmarked"];
      const validPnl = ["profit", "loss", "unmarked"];

      const normalizedTriggered = validTriggered.includes(outcome.triggeredStatus)
        ? outcome.triggeredStatus
        : undefined;
      let normalizedPnl = validPnl.includes(outcome.pnlStatus)
        ? outcome.pnlStatus
        : undefined;

      const update = {
        updatedAt: new Date(),
        outcomeUpdatedAt: new Date(),
      };

      if (normalizedTriggered) {
        update.triggeredStatus = normalizedTriggered;
      }

      if (normalizedPnl) {
        update.pnlStatus = normalizedPnl;
      }

      if (normalizedTriggered === "not_triggered") {
        update.pnlStatus = "unmarked";
        normalizedPnl = "unmarked";
      }

      if (normalizedTriggered === "unmarked" && !normalizedPnl) {
        update.pnlStatus = "unmarked";
      }

      await this._getCollection().updateOne(
        {
          symbol: symbol.toUpperCase(),
          scannedDate: date,
        },
        { $set: update },
      );

      return await this._getCollection().findOne({
        symbol: symbol.toUpperCase(),
        scannedDate: date,
      });
    } catch (error) {
      logger.error(
        `Failed to update outcome for ${symbol} on ${date}:`,
        error
      );
      throw new DatabaseError(`Failed to update stock outcome: ${error.message}`);
    }
  }

  /**
   * Get outcome report for a date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Outcome report
   */
  async getDateOutcomeReport(date) {
    try {
      const stocks = await this._getCollection()
        .find({ scannedDate: date })
        .project({
          symbol: 1,
          triggeredStatus: 1,
          pnlStatus: 1,
          per_chg: 1,
          volume: 1,
        })
        .toArray();

      const totalShortlisted = stocks.length;

      const normalizedStocks = stocks.map((stock) => ({
        triggeredStatus: ["triggered", "not_triggered", "unmarked"].includes(
          stock.triggeredStatus
        )
          ? stock.triggeredStatus
          : "unmarked",
        pnlStatus: ["profit", "loss", "unmarked"].includes(stock.pnlStatus)
          ? stock.pnlStatus
          : "unmarked",
        change: Number(stock.per_chg) || 0,
        volume: Number(stock.volume) || 0,
      }));

      const triggered = normalizedStocks.filter(
        (s) => s.triggeredStatus === "triggered"
      ).length;
      const notTriggered = normalizedStocks.filter(
        (s) => s.triggeredStatus === "not_triggered"
      ).length;
      const unmarkedTrigger = normalizedStocks.filter(
        (s) => s.triggeredStatus === "unmarked"
      ).length;

      const profits = normalizedStocks.filter((s) => s.pnlStatus === "profit").length;
      const losses = normalizedStocks.filter((s) => s.pnlStatus === "loss").length;
      const unmarkedPnl = normalizedStocks.filter(
        (s) => s.pnlStatus === "unmarked"
      ).length;

      const resolvedTrades = profits + losses;
      const openTriggeredTrades = Math.max(triggered - resolvedTrades, 0);
      const totalVolume = normalizedStocks.reduce((sum, s) => sum + s.volume, 0);
      const avgChange =
        totalShortlisted > 0
          ? normalizedStocks.reduce((sum, s) => sum + s.change, 0) /
            totalShortlisted
          : 0;

      const triggerRate =
        totalShortlisted > 0 ? (triggered / totalShortlisted) * 100 : 0;
      const winRate = resolvedTrades > 0 ? (profits / resolvedTrades) * 100 : 0;

      return {
        date,
        totalShortlisted,
        triggered,
        notTriggered,
        unmarkedTrigger,
        profits,
        losses,
        unmarkedPnl,
        resolvedTrades,
        openTriggeredTrades,
        triggerRate: Number(triggerRate.toFixed(2)),
        winRate: Number(winRate.toFixed(2)),
        avgChange: Number(avgChange.toFixed(2)),
        totalVolume,
      };
    } catch (error) {
      logger.error(`Failed to build outcome report for ${date}:`, error);
      throw new DatabaseError(`Failed to build outcome report: ${error.message}`);
    }
  }

  /**
   * Get aggregated outcome report across all dates
   * @param {number} dateLimit - Number of recent date summaries
   * @returns {Promise<Object>} Aggregate report
   */
  async getAggregateOutcomeReport(dateLimit = 30) {
    try {
      const stocks = await this._getCollection()
        .find({
          scannedDate: { $ne: null, $exists: true },
        })
        .project({
          scannedDate: 1,
          triggeredStatus: 1,
          pnlStatus: 1,
          per_chg: 1,
          volume: 1,
        })
        .toArray();

      const safeDateLimit =
        Number.isFinite(dateLimit) && dateLimit > 0
          ? Math.min(Math.floor(dateLimit), 100)
          : 30;

      const byDateMap = new Map();
      const summary = {
        totalShortlisted: 0,
        triggered: 0,
        notTriggered: 0,
        unmarkedTrigger: 0,
        profits: 0,
        losses: 0,
        unmarkedPnl: 0,
        totalVolume: 0,
        totalChange: 0,
        totalScans: 0,
      };

      const normalizeTriggered = (value) =>
        ["triggered", "not_triggered", "unmarked"].includes(value)
          ? value
          : "unmarked";
      const normalizePnl = (value) =>
        ["profit", "loss", "unmarked"].includes(value) ? value : "unmarked";

      for (const stock of stocks) {
        const date = stock.scannedDate;
        const triggeredStatus = normalizeTriggered(stock.triggeredStatus);
        const pnlStatus = normalizePnl(stock.pnlStatus);
        const change = Number(stock.per_chg) || 0;
        const volume = Number(stock.volume) || 0;

        summary.totalShortlisted += 1;
        summary.totalVolume += volume;
        summary.totalChange += change;

        if (triggeredStatus === "triggered") summary.triggered += 1;
        if (triggeredStatus === "not_triggered") summary.notTriggered += 1;
        if (triggeredStatus === "unmarked") summary.unmarkedTrigger += 1;

        if (pnlStatus === "profit") summary.profits += 1;
        if (pnlStatus === "loss") summary.losses += 1;
        if (pnlStatus === "unmarked") summary.unmarkedPnl += 1;

        if (!byDateMap.has(date)) {
          byDateMap.set(date, {
            date,
            totalShortlisted: 0,
            triggered: 0,
            notTriggered: 0,
            profits: 0,
            losses: 0,
          });
        }

        const day = byDateMap.get(date);
        day.totalShortlisted += 1;
        if (triggeredStatus === "triggered") day.triggered += 1;
        if (triggeredStatus === "not_triggered") day.notTriggered += 1;
        if (pnlStatus === "profit") day.profits += 1;
        if (pnlStatus === "loss") day.losses += 1;
      }

      const resolvedTrades = summary.profits + summary.losses;
      const openTriggeredTrades = Math.max(summary.triggered - resolvedTrades, 0);
      const avgChange =
        summary.totalShortlisted > 0
          ? summary.totalChange / summary.totalShortlisted
          : 0;
      const triggerRate =
        summary.totalShortlisted > 0
          ? (summary.triggered / summary.totalShortlisted) * 100
          : 0;
      const winRate =
        resolvedTrades > 0 ? (summary.profits / resolvedTrades) * 100 : 0;

      const byDate = Array.from(byDateMap.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, safeDateLimit);

      summary.totalScans = byDateMap.size;

      return {
        summary: {
          ...summary,
          resolvedTrades,
          openTriggeredTrades,
          avgChange: Number(avgChange.toFixed(2)),
          triggerRate: Number(triggerRate.toFixed(2)),
          winRate: Number(winRate.toFixed(2)),
        },
        byDate,
      };
    } catch (error) {
      logger.error("Failed to build aggregate outcome report:", error);
      throw new DatabaseError(
        `Failed to build aggregate outcome report: ${error.message}`
      );
    }
  }
}

module.exports = StockRepository;
