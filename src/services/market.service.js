const NSEService = require('./nse.service');
const logger = require('../utils/logger');

class MarketDataService {
  constructor() {
    this.nseService = new NSEService();
  }

  async getStockQuote(symbol) {
      try {
        logger.debug(`Trying NSE for ${symbol}...`);
        const quote = await this.nseService.getStockQuote(symbol);
        if (quote) return quote;
      } catch (error) {
        logger.warn(`NSE failed for ${symbol}`);
      }
  }

  async getNifty50Data() {
      try {
        logger.info('Fetching Nifty 50 data from NSE...');
        return await this.nseService.getNifty50Data();
      } catch (error) {
        logger.warn(`NSE failed for Nifty 50, ${error.message}`);
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
          
          // Small delay between NSE requests
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
      
      return enrichedStocks;
    }
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