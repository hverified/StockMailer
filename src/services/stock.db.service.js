// src/services/stock.db.service.js
const mongodb = require('../config/mongodb');
const logger = require('../utils/logger');
const helpers = require('../utils/helpers');

class StockDBService {
  async saveStocks(stocks, niftyData) {
    try {
      const db = mongodb.getDb();
      const scannedDate = helpers.currentDate();
      const timestamp = new Date();

      const bulkOps = stocks.map(stock => ({
        updateOne: {
          filter: { 
            symbol: stock.symbol, 
            scannedDate: scannedDate 
          },
          update: {
            $set: {
              ...stock,
              scannedDate,
              timestamp,
              niftyData: {
                currentPrice: niftyData.currentPrice,
                ema20: niftyData.ema20,
                isAboveEMA: niftyData.isAboveEMA
              }
            }
          },
          upsert: true
        }
      }));

      if (bulkOps.length > 0) {
        const result = await db.collection('stocks').bulkWrite(bulkOps);
        logger.info(`Saved ${result.upsertedCount + result.modifiedCount} stocks to database`);
        return result;
      }

      return null;
    } catch (error) {
      logger.error(`Error saving stocks: ${error.message}`);
      throw error;
    }
  }

  async getStocksByDate(date) {
    try {
      const db = mongodb.getDb();
      const stocks = await db.collection('stocks')
        .find({ scannedDate: date })
        .sort({ timestamp: -1 })
        .toArray();
      
      return stocks;
    } catch (error) {
      logger.error(`Error fetching stocks by date: ${error.message}`);
      throw error;
    }
  }

  async getAllScanDates(limit = 30) {
    try {
      const db = mongodb.getDb();
      const dates = await db.collection('stocks')
        .aggregate([
          {
            $group: {
              _id: '$scannedDate',
              count: { $sum: 1 },
              timestamp: { $first: '$timestamp' },
              niftyData: { $first: '$niftyData' }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: limit }
        ])
        .toArray();
      
      return dates.map(d => ({
        date: d._id,
        count: d.count,
        timestamp: d.timestamp,
        niftyData: d.niftyData
      }));
    } catch (error) {
      logger.error(`Error fetching scan dates: ${error.message}`);
      throw error;
    }
  }

  async getStockHistory(symbol, limit = 10) {
    try {
      const db = mongodb.getDb();
      const history = await db.collection('stocks')
        .find({ symbol })
        .sort({ scannedDate: -1 })
        .limit(limit)
        .toArray();
      
      return history;
    } catch (error) {
      logger.error(`Error fetching stock history: ${error.message}`);
      throw error;
    }
  }

  async deleteOldScans(daysToKeep = 90) {
    try {
      const db = mongodb.getDb();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await db.collection('stocks').deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      logger.info(`Deleted ${result.deletedCount} old stock records`);
      return result;
    } catch (error) {
      logger.error(`Error deleting old scans: ${error.message}`);
      throw error;
    }
  }
}

module.exports = StockDBService;