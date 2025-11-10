const yahooFinance = require('yahoo-finance2').default;
const logger = require('../utils/logger');

class YahooFinanceService {
  async getStockQuote(symbol) {
    try {
      // Add .NS for NSE stocks, .BO for BSE stocks
      const quote = await yahooFinance.quote(`${symbol}.NS`);
      return {
        symbol: symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap
      };
    } catch (error) {
      logger.error(`Error fetching quote for ${symbol}: ${error.message}`);
      return null;
    }
  }

  async getHistoricalData(symbol, period1, period2) {
    try {
      const result = await yahooFinance.historical(`${symbol}.NS`, {
        period1,
        period2
      });
      return result;
    } catch (error) {
      logger.error(`Error fetching historical data for ${symbol}: ${error.message}`);
      return null;
    }
  }
}

module.exports = YahooFinanceService;