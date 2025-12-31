const YahooFinance = require('yahoo-finance2').default;
const logger = require('../utils/logger');

class YahooFinanceService {
  constructor() {
    // Create a new instance of YahooFinance for v3.x
    this.yahooFinance = new YahooFinance();
  }

  // Helper function to add delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry wrapper with exponential backoff
  async retryWithBackoff(fn, maxRetries = 3, initialDelay = 2000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Add delay before each attempt (except first)
        if (i > 0) {
          const delayTime = initialDelay * Math.pow(2, i - 1);
          logger.info(`Retry attempt ${i + 1}/${maxRetries} after ${delayTime}ms delay...`);
          await this.delay(delayTime);
        }
        
        return await fn();
      } catch (error) {
        lastError = error;
        
        // If it's a 429 error or rate limit, retry
        if (error.message && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
          logger.warn(`Rate limit hit, retrying... (${i + 1}/${maxRetries})`);
          continue;
        }
        
        // For other errors, throw immediately
        throw error;
      }
    }
    
    throw lastError;
  }

  async getStockQuote(symbol) {
    return this.retryWithBackoff(async () => {
      try {
        await this.delay(800); // Delay before request
        
        const quote = await this.yahooFinance.quote(`${symbol}.NS`, {
          fields: ['regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent', 
                   'regularMarketVolume', 'marketCap', 'regularMarketDayHigh', 'regularMarketDayLow']
        });
        
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
        throw error;
      }
    }, 3, 2000);
  }

  async getHistoricalData(symbol, period1, period2) {
    return this.retryWithBackoff(async () => {
      try {
        await this.delay(800);
        
        const result = await this.yahooFinance.historical(`${symbol}.NS`, {
          period1,
          period2,
          interval: '1d'
        });
        
        return result;
      } catch (error) {
        logger.error(`Error fetching historical data for ${symbol}: ${error.message}`);
        throw error;
      }
    }, 3, 2000);
  }

  async getNifty50Data() {
    return this.retryWithBackoff(async () => {
      try {
        logger.info('Fetching Nifty 50 current price...');
        
        // Add longer delay before request
        await this.delay(5000); // Increased to 5 seconds
        
        // Get current Nifty 50 quote
        const quote = await this.yahooFinance.quote('^NSEI', {
          fields: ['regularMarketPrice']
        });
        
        const currentPrice = quote.regularMarketPrice;
        
        logger.info('Fetching Nifty 50 historical data for EMA calculation...');
        
        // Add longer delay before next request
        await this.delay(5000); // Increased to 5 seconds
        
        // Get last 40 days of historical data to calculate 20-day EMA
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 40);
        
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
    }, 3, 10000); // Reduced to 3 retries with 10 second initial delay
  }

  calculateEMA(historicalData, period) {
    const sortedData = historicalData
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-period);
    
    if (sortedData.length < period) {
      throw new Error(`Insufficient data for EMA calculation. Need ${period} days, got ${sortedData.length}`);
    }
    
    const multiplier = 2 / (period + 1);
    const initialSMA = sortedData.slice(0, period).reduce((sum, day) => sum + day.close, 0) / period;
    
    let ema = initialSMA;
    for (let i = period; i < sortedData.length; i++) {
      ema = (sortedData[i].close - ema) * multiplier + ema;
    }
    
    return parseFloat(ema.toFixed(2));
  }

  async enrichStocksWithDayHigh(stocks) {
    logger.info(`Enriching ${stocks.length} stocks with day high data...`);
    
    // Process stocks one at a time to avoid rate limits
    const enrichedStocks = [];
    
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      
      try {
        logger.info(`Processing ${i + 1}/${stocks.length}: ${stock.symbol}`);
        
        const quote = await this.getStockQuote(stock.symbol);
        
        enrichedStocks.push({
          ...stock,
          dayHigh: quote ? quote.dayHigh : null
        });
        
        // Add delay between stocks
        if (i < stocks.length - 1) {
          await this.delay(2000); // 2 second delay between stocks
        }
      } catch (error) {
        logger.error(`Error enriching ${stock.symbol}: ${error.message}`);
        enrichedStocks.push({
          ...stock,
          dayHigh: null
        });
        
        // Add extra delay after error
        await this.delay(3000);
      }
    }
    
    logger.info('Stock enrichment completed');
    return enrichedStocks;
  }

  async enrichStocksWithDayAndPrevHighs(stocks) {
    logger.info(`Enriching ${stocks.length} stocks with current and previous day high data...`);
    
    // Process stocks one at a time to avoid rate limits
    const enrichedStocks = [];
    
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      
      try {
        logger.info(`Processing ${i + 1}/${stocks.length}: ${stock.symbol}`);
        
        // Get current quote
        const quote = await this.getStockQuote(stock.symbol);
        
        // Delay before historical request
        await this.delay(1500);
        
        // Get historical data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 5);
        
        const historicalData = await this.getHistoricalData(
          stock.symbol,
          startDate,
          endDate
        );
        
        let prevDayHigh = null;
        
        if (historicalData && historicalData.length >= 2) {
          const sortedData = historicalData.sort((a, b) => new Date(b.date) - new Date(a.date));
          prevDayHigh = sortedData[1]?.high || null;
        }
        
        enrichedStocks.push({
          ...stock,
          todayHigh: quote ? quote.dayHigh : null,
          prevDayHigh: prevDayHigh
        });
        
        // Add delay between stocks
        if (i < stocks.length - 1) {
          await this.delay(3000); // 3 second delay between stocks
        }
      } catch (error) {
        logger.error(`Error enriching ${stock.symbol} with day/prev highs: ${error.message}`);
        enrichedStocks.push({
          ...stock,
          todayHigh: null,
          prevDayHigh: null
        });
        
        // Add extra delay after error
        await this.delay(4000);
      }
    }
    
    logger.info('Stock enrichment with day/prev highs completed');
    return enrichedStocks;
  }
}

module.exports = YahooFinanceService;