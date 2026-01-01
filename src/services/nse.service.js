// src/services/nse.service.js
const axios = require('axios');
const logger = require('../utils/logger');

class NSEService {
  constructor() {
    this.baseUrl = 'https://www.nseindia.com/api';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://www.nseindia.com'
    };
    this.cookies = null;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async initSession() {
    try {
      const response = await axios.get('https://www.nseindia.com', {
        headers: this.headers,
        timeout: 10000
      });
      
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        this.cookies = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
        logger.debug('NSE session initialized');
      }
    } catch (error) {
      logger.error(`Error initializing NSE session: ${error.message}`);
    }
  }

  async getStockQuote(symbol) {
    try {
      if (!this.cookies) {
        await this.initSession();
        await this.delay(1000);
      }

      const url = `${this.baseUrl}/quote-equity?symbol=${symbol}`;
      const response = await axios.get(url, {
        headers: {
          ...this.headers,
          'Cookie': this.cookies
        },
        timeout: 10000
      });

      const data = response.data;
      const priceInfo = data.priceInfo;

      return {
        symbol: symbol,
        price: priceInfo.lastPrice,
        change: priceInfo.change,
        changePercent: priceInfo.pChange,
        volume: data.preOpenMarket?.totalTradedVolume || 0,
        dayHigh: priceInfo.intraDayHighLow?.max || priceInfo.lastPrice,
        dayLow: priceInfo.intraDayHighLow?.min || priceInfo.lastPrice,
        open: priceInfo.open,
        previousClose: priceInfo.previousClose
      };
    } catch (error) {
      logger.error(`Error fetching NSE quote for ${symbol}: ${error.message}`);
      return null;
    }
  }

  async getNifty50Data() {
    try {
      if (!this.cookies) {
        await this.initSession();
        await this.delay(1000);
      }

      const url = `${this.baseUrl}/allIndices`;
      const response = await axios.get(url, {
        headers: {
          ...this.headers,
          'Cookie': this.cookies
        },
        timeout: 10000
      });

      const niftyData = response.data.data.find(index => index.index === 'NIFTY 50');
      
      if (!niftyData) {
        throw new Error('Nifty 50 data not found');
      }

      return {
        currentPrice: niftyData.last,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Error fetching Nifty 50 from NSE: ${error.message}`);
      throw error;
    }
  }

  async getHistoricalData(symbol, days = 30) {
    try {
      if (!this.cookies) {
        await this.initSession();
        await this.delay(1000);
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const url = `${this.baseUrl}/historical/cm/equity?symbol=${symbol}&series=[%22EQ%22]&from=${formatDate(startDate)}&to=${formatDate(endDate)}`;
      
      const response = await axios.get(url, {
        headers: {
          ...this.headers,
          'Cookie': this.cookies
        },
        timeout: 15000
      });

      return response.data.data || [];
    } catch (error) {
      logger.error(`Error fetching historical data for ${symbol}: ${error.message}`);
      return [];
    }
  }
}

module.exports = NSEService;