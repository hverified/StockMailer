import ChartinkScraper from "../../../src/services/scraper.service";
import EmailService from "../../../src/services/email.service";
import MarketDataService from "../../../src/services/market.service";
import StockDBService from "../../../src/services/stock.db.service";
import mongodb from "../../../src/config/mongodb";
import logger from "../../../src/utils/logger";
import { getErrorResponse, json } from "../_lib/server";

async function runCron(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn("Unauthorized cron request attempt");
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await mongodb.connect();

    const scraper = new ChartinkScraper();
    const emailService = new EmailService();
    const marketService = new MarketDataService();
    const stockDBService = new StockDBService();

    const niftyData = await marketService.getNifty50Data();
    const stocks = await scraper.scrapeStocks();

    let filteredStocks = [];
    if (niftyData.isAboveEMA) {
      filteredStocks = await marketService.enrichStocksWithDayHigh(stocks);
    }

    await stockDBService.saveStocks(filteredStocks, niftyData);
    const emailResult = await emailService.sendStockReport(filteredStocks, niftyData);

    return json({
      success: true,
      timestamp: new Date().toISOString(),
      niftyData: {
        currentPrice: niftyData.currentPrice,
        ema20: niftyData.ema20,
        isAboveEMA: niftyData.isAboveEMA,
      },
      stocksScraped: stocks.length,
      stocksIncluded: filteredStocks.length,
      emailSent: !emailResult.skipped,
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function GET(request) {
  return runCron(request);
}

export async function POST(request) {
  return runCron(request);
}
