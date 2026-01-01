// src/services/nifty.db.service.js
const mongodb = require('../config/mongodb');
const logger = require('../utils/logger');
const helpers = require('../utils/helpers');

class NiftyDBService {
  async saveNiftyData(price, date = null) {
    try {
      const db = mongodb.getDb();
      const dataDate = date || helpers.currentDate();
      const timestamp = new Date();

      const result = await db.collection('nifty50').updateOne(
        { date: dataDate },
        {
          $set: {
            date: dataDate,
            price: parseFloat(price),
            timestamp
          }
        },
        { upsert: true }
      );

      logger.info(`Saved Nifty 50 data for ${dataDate}: ₹${price}`);
      return result;
    } catch (error) {
      logger.error(`Error saving Nifty data: ${error.message}`);
      throw error;
    }
  }

  async getHistoricalPrices(days = 20) {
    try {
      const db = mongodb.getDb();
      const prices = await db.collection('nifty50')
        .find({})
        .sort({ date: -1 })
        .limit(days)
        .toArray();
      
      // Return in chronological order (oldest first)
      return prices.reverse();
    } catch (error) {
      logger.error(`Error fetching Nifty historical prices: ${error.message}`);
      throw error;
    }
  }

  async calculateEMA20() {
    try {
      const prices = await this.getHistoricalPrices(20);
      
      if (prices.length < 20) {
        logger.warn(`Insufficient data for EMA calculation. Found ${prices.length}/20 days`);
        return null;
      }

      // EMA calculation
      const multiplier = 2 / (20 + 1);
      let ema = prices[0].price; // Start with first price

      for (let i = 1; i < prices.length; i++) {
        ema = (prices[i].price - ema) * multiplier + ema;
      }

      return parseFloat(ema.toFixed(2));
    } catch (error) {
      logger.error(`Error calculating EMA: ${error.message}`);
      throw error;
    }
  }

  async getCurrentPrice() {
    try {
      const db = mongodb.getDb();
      const latest = await db.collection('nifty50')
        .findOne({}, { sort: { date: -1 } });
      
      return latest ? latest.price : null;
    } catch (error) {
      logger.error(`Error fetching current Nifty price: ${error.message}`);
      throw error;
    }
  }

  async seedInitialData(data) {
    try {
      const db = mongodb.getDb();
      
      const bulkOps = data.map(item => ({
        updateOne: {
          filter: { date: item.date },
          update: {
            $set: {
              date: item.date,
              price: parseFloat(item.price),
              timestamp: new Date(item.date)
            }
          },
          upsert: true
        }
      }));

      const result = await db.collection('nifty50').bulkWrite(bulkOps);
      logger.info(`Seeded ${result.upsertedCount + result.modifiedCount} Nifty 50 records`);
      return result;
    } catch (error) {
      logger.error(`Error seeding Nifty data: ${error.message}`);
      throw error;
    }
  }

  async deleteOldData(daysToKeep = 365) {
    try {
      const db = mongodb.getDb();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await db.collection('nifty50').deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      logger.info(`Deleted ${result.deletedCount} old Nifty 50 records`);
      return result;
    } catch (error) {
      logger.error(`Error deleting old Nifty data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = NiftyDBService;