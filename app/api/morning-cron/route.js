import ChartinkScraper from "../../../src/services/scraper.service";
import EmailService from "../../../src/services/email.service";
import MarketDataService from "../../../src/services/market.service";
import logger from "../../../src/utils/logger";
import { getErrorResponse, json } from "../_lib/server";

async function runMorningCron(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn("Unauthorized morning cron request attempt");
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const scraper = new ChartinkScraper();
    const emailService = new EmailService();
    const marketService = new MarketDataService();

    const niftyData = await marketService.getNifty50Data();
    const stocks = await scraper.scrapeStocks();
    const enrichedStocks = await marketService.enrichStocksWithDayAndPrevHighs(stocks);
    const emailResult = await emailService.sendMorningStockReport(enrichedStocks, niftyData);

    return json({
      success: true,
      timestamp: new Date().toISOString(),
      niftyData: {
        currentPrice: niftyData.currentPrice,
        ema20: niftyData.ema20,
        isAboveEMA: niftyData.isAboveEMA,
      },
      stocksScraped: stocks.length,
      stocksProcessed: enrichedStocks.length,
      emailSent: !emailResult.skipped,
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function GET(request) {
  return runMorningCron(request);
}

export async function POST(request) {
  return runMorningCron(request);
}
