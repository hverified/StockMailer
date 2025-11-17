const YahooFinanceClass = require('yahoo-finance2').default;
const logger = require('../utils/logger');

class YahooFinanceService {
  constructor() {
    // Create an instance of YahooFinance for v3.x
    this.yahooFinance = new YahooFinanceClass();
  }

  async getStockQuote(symbol) {
    try {
      // Add .NS for NSE stocks, .BO for BSE stocks
      const quote = await this.yahooFinance.quote(`${symbol}.NS`);
      
      return {
        symbol: symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow
      };
    } catch (error) {
      logger.error(`Error fetching quote for ${symbol}: ${error.message}`);
      return null;
    }
  }

  async getHistoricalData(symbol, period1, period2) {
    try {
      const result = await this.yahooFinance.historical(`${symbol}.NS`, {
        period1,
        period2
      });
      return result;
    } catch (error) {
      logger.error(`Error fetching historical data for ${symbol}: ${error.message}`);
      return null;
    }
  }

  async getNifty50Data() {
    try {
      logger.info('Fetching Nifty 50 current price...');
      
      // Get current Nifty 50 quote
      const quote = await this.yahooFinance.quote('^NSEI');
      const currentPrice = quote.regularMarketPrice;
      
      logger.info('Fetching Nifty 50 historical data for EMA calculation...');
      
      // Get last 30 days of historical data to calculate 20-day EMA
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 40); // Get extra days to ensure we have 20 trading days
      
      const historicalData = await this.yahooFinance.historical('^NSEI', {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      });
      
      // Calculate 20-day EMA
      const ema20 = this.calculateEMA(historicalData, 20);
      
      logger.info(`Nifty 50: Current=${currentPrice}, EMA20=${ema20}`);
      
      return {
        currentPrice: currentPrice,
        ema20: ema20,
        isAboveEMA: currentPrice > ema20,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Error fetching Nifty 50 data: ${error.message}`);
      throw error;
    }
  }

  calculateEMA(historicalData, period) {
    // Sort data by date (oldest first)
    const sortedData = historicalData
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-period); // Get last 'period' days
    
    if (sortedData.length < period) {
      throw new Error(`Insufficient data for EMA calculation. Need ${period} days, got ${sortedData.length}`);
    }
    
    // Calculate multiplier
    const multiplier = 2 / (period + 1);
    
    // Calculate initial SMA (Simple Moving Average)
    const initialSMA = sortedData.slice(0, period).reduce((sum, day) => sum + day.close, 0) / period;
    
    // Calculate EMA
    let ema = initialSMA;
    for (let i = period; i < sortedData.length; i++) {
      ema = (sortedData[i].close - ema) * multiplier + ema;
    }
    
    return parseFloat(ema.toFixed(2));
  }

  async enrichStocksWithDayHigh(stocks) {
    logger.info(`Enriching ${stocks.length} stocks with day high data...`);
    
    // Process stocks in batches to avoid rate limiting
    const batchSize = 5;
    const enrichedStocks = [];
    
    for (let i = 0; i < stocks.length; i += batchSize) {
      const batch = stocks.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (stock) => {
          try {
            const quote = await this.getStockQuote(stock.symbol);
            return {
              ...stock,
              dayHigh: quote ? quote.dayHigh : null
            };
          } catch (error) {
            logger.error(`Error enriching ${stock.symbol}: ${error.message}`);
            return {
              ...stock,
              dayHigh: null
            };
          }
        })
      );
      
      enrichedStocks.push(...batchResults);
      
      // Add a small delay between batches
      if (i + batchSize < stocks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    logger.info('Stock enrichment completed');
    return enrichedStocks;
  }
}

module.exports = YahooFinanceService;