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
}

module.exports = StockRepository;
