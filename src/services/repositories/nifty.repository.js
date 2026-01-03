// src/services/repositories/nifty.repository.js
const logger = require("../../utils/logger");
const DateUtil = require("../../utils/date.util");
const { DatabaseError } = require("../../middleware/error-handler.middleware");
const config = require("../../config/app.config");

class NiftyRepository {
  constructor(database) {
    this.db = database;
    this.collectionName = "nifty50";
  }

  _getCollection() {
    if (!this.db) {
      throw new DatabaseError("Database connection not initialized");
    }
    return this.db.collection(this.collectionName);
  }

  async savePrice(price, date = null) {
    try {
      const dataDate = date || DateUtil.getCurrentDate();
      const timestamp = new Date();

      const result = await this._getCollection().updateOne(
        { date: dataDate },
        {
          $set: {
            date: dataDate,
            price: parseFloat(price),
            timestamp,
          },
        },
        { upsert: true }
      );

      logger.info(`Saved Nifty 50 data for ${dataDate}: ₹${price}`);
      return result;
    } catch (error) {
      logger.error("Failed to save Nifty data:", error);
      throw new DatabaseError(`Failed to save Nifty data: ${error.message}`);
    }
  }

  async getHistoricalPrices(days = config.market.emaSettings.period) {
    try {
      const prices = await this._getCollection()
        .find({})
        .sort({ date: -1 })
        .limit(days)
        .toArray();

      return prices.reverse();
    } catch (error) {
      logger.error("Failed to fetch Nifty historical prices:", error);
      throw new DatabaseError(
        `Failed to fetch historical prices: ${error.message}`
      );
    }
  }

  async calculateEMA20() {
    try {
      const period = config.market.emaSettings.period;
      const prices = await this.getHistoricalPrices(period);

      if (prices.length < period) {
        logger.warn(
          `Insufficient data for EMA calculation. Found ${prices.length}/${period} days`
        );
        return null;
      }

      const multiplier = config.market.emaSettings.multiplier;
      let ema = prices[0].price;

      for (let i = 1; i < prices.length; i++) {
        ema = (prices[i].price - ema) * multiplier + ema;
      }

      return parseFloat(ema.toFixed(2));
    } catch (error) {
      logger.error("Failed to calculate EMA:", error);
      throw new DatabaseError(`Failed to calculate EMA: ${error.message}`);
    }
  }

  async bulkSeed(data) {
    try {
      const operations = data.map((item) => ({
        updateOne: {
          filter: { date: item.date },
          update: {
            $set: {
              date: item.date,
              price: parseFloat(item.price),
              timestamp: new Date(item.date),
            },
          },
          upsert: true,
        },
      }));

      const result = await this._getCollection().bulkWrite(operations);
      logger.info(
        `Seeded ${result.upsertedCount + result.modifiedCount} Nifty 50 records`
      );
      return result;
    } catch (error) {
      logger.error("Failed to seed Nifty data:", error);
      throw new DatabaseError(`Failed to seed data: ${error.message}`);
    }
  }

  async deleteOlderThan(daysToKeep = config.market.retention.niftyHistoryDays) {
    try {
      const cutoffDate = DateUtil.getDaysAgo(daysToKeep);

      const result = await this._getCollection().deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      logger.info(`Deleted ${result.deletedCount} old Nifty 50 records`);
      return result.deletedCount;
    } catch (error) {
      logger.error("Failed to delete old Nifty data:", error);
      throw new DatabaseError(`Failed to delete old data: ${error.message}`);
    }
  }
}

module.exports = NiftyRepository;
