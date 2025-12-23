// src/services/storage.service.js
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class StorageService {
  constructor() {
    // Use /tmp for Vercel, local directory otherwise
    this.storageDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../../data');
    this.stocksFile = path.join(this.storageDir, 'daily-stocks.json');
    
    // Ensure directory exists
    this.ensureDirectory();
  }

  ensureDirectory() {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
        logger.info(`Created storage directory: ${this.storageDir}`);
      }
    } catch (error) {
      logger.error(`Error creating storage directory: ${error.message}`);
    }
  }

  async saveStocks(stocks, niftyData) {
    try {
      const data = {
        stocks,
        niftyData,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };

      fs.writeFileSync(this.stocksFile, JSON.stringify(data, null, 2));
      logger.info(`Saved ${stocks.length} stocks to ${this.stocksFile}`);
      return true;
    } catch (error) {
      logger.error(`Error saving stocks: ${error.message}`);
      throw error;
    }
  }

  async loadStocks() {
    try {
      if (!fs.existsSync(this.stocksFile)) {
        logger.warn('No stocks file found');
        return null;
      }

      const data = JSON.parse(fs.readFileSync(this.stocksFile, 'utf8'));
      
      // Check if data is from today
      const today = new Date().toISOString().split('T')[0];
      if (data.date !== today) {
        logger.warn(`Stocks file is from ${data.date}, not today (${today})`);
        return null;
      }

      logger.info(`Loaded ${data.stocks.length} stocks from ${this.stocksFile}`);
      return data;
    } catch (error) {
      logger.error(`Error loading stocks: ${error.message}`);
      return null;
    }
  }

  async clearStocks() {
    try {
      if (fs.existsSync(this.stocksFile)) {
        fs.unlinkSync(this.stocksFile);
        logger.info('Cleared stocks file');
      }
    } catch (error) {
      logger.error(`Error clearing stocks: ${error.message}`);
    }
  }
}

module.exports = StorageService;