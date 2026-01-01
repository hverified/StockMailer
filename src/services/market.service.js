// src/services/market.service.js
const NSEService = require('./nse.service');
const NiftyDBService = require('./nifty.db.service');
const logger = require('../utils/logger');

class MarketDataService {
  constructor() {
    this.nseService = new NSEService();
    this.niftyDBService = new NiftyDBService();
  }

  async getStockQuote(symbol) {
    try {
      logger.debug(`Fetching quote for ${symbol} from NSE...`);
      const quote = await this.nseService.getStockQuote(symbol);
      return quote;
    } catch (error) {
      logger.warn(`NSE failed for ${symbol}: ${error.message}`);
      return null;
    }
  }

  async getNifty50Data() {
    try {
      logger.info('Fetching Nifty 50 data from NSE...');
      
      // Get current price from NSE
      const niftyData = await this.nseService.getNifty50Data();
      const currentPrice = niftyData.currentPrice;
      
      // Save current price to database
      await this.niftyDBService.saveNiftyData(currentPrice);
      
      // Calculate EMA20 from database
      const ema20 = await this.niftyDBService.calculateEMA20();
      
      if (!ema20) {
        logger.warn('Could not calculate EMA20, using estimation');
        return {
          currentPrice,
          ema20: currentPrice * 0.98, // Fallback estimation
          isAboveEMA: true,
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        currentPrice,
        ema20,
        isAboveEMA: currentPrice > ema20,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Error fetching Nifty 50 data: ${error.message}`);
      throw error;
    }
  }

  async enrichStocksWithDayHigh(stocks) {
    logger.info(`Enriching ${stocks.length} stocks with NSE data...`);
    
    const enrichedStocks = [];
    
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      
      try {
        logger.info(`Processing ${i + 1}/${stocks.length}: ${stock.symbol}`);
        
        const quote = await this.nseService.getStockQuote(stock.symbol);
        
        enrichedStocks.push({
          ...stock,
          dayHigh: quote ? quote.dayHigh : null
        });
        
        if (i < stocks.length - 1) {
          await this.nseService.delay(1000);
        }
      } catch (error) {
        logger.error(`Error enriching ${stock.symbol}: ${error.message}`);
        enrichedStocks.push({
          ...stock,
          dayHigh: null
        });
      }
    }
    
    return enrichedStocks;
  }

  async enrichStocksWithDayAndPrevHighs(stocks) {
    logger.info(`Enriching ${stocks.length} stocks with NSE data...`);
    
    const enrichedStocks = [];
    
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      
      try {
        logger.info(`Processing ${i + 1}/${stocks.length}: ${stock.symbol}`);
        
        const quote = await this.nseService.getStockQuote(stock.symbol);
        const historicalData = await this.nseService.getHistoricalData(stock.symbol, 5);
        
        let prevDayHigh = null;
        if (historicalData.length >= 2) {
          prevDayHigh = historicalData[historicalData.length - 2].CH_TRADE_HIGH_PRICE;
        }
        
        enrichedStocks.push({
          ...stock,
          todayHigh: quote ? quote.dayHigh : null,
          prevDayHigh: prevDayHigh
        });
        
        if (i < stocks.length - 1) {
          await this.nseService.delay(1500);
        }
      } catch (error) {
        logger.error(`Error enriching ${stock.symbol}: ${error.message}`);
        enrichedStocks.push({
          ...stock,
          todayHigh: null,
          prevDayHigh: null
        });
      }
    }
    
    return enrichedStocks;
  }
}

module.exports = MarketDataService;