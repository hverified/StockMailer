import ChartinkScraper from "../../../src/services/scraper.service";
import EmailService from "../../../src/services/email.service";
import MarketDataService from "../../../src/services/market.service";
import { ensureDb, getErrorResponse, json } from "../_lib/server";

export async function POST() {
  try {
    await ensureDb();
    const scraper = new ChartinkScraper();
    const emailService = new EmailService();
    const marketService = new MarketDataService();

    const niftyData = await marketService.getNifty50Data();
    const stocks = await scraper.scrapeStocks();
    const enrichedStocks = await marketService.enrichStocksWithDayAndPrevHighs(stocks);
    const emailResult = await emailService.sendMorningStockReport(enrichedStocks, niftyData);

    return json({
      success: true,
      message: emailResult.skipped
        ? "Morning report generated. No shortlisted stocks, email skipped"
        : "Morning report generated and sent successfully",
      emailSent: !emailResult.skipped,
      niftyAboveEMA: niftyData.isAboveEMA,
      niftyPrice: niftyData.currentPrice,
      ema20: niftyData.ema20,
      stocksScraped: stocks.length,
      stocksProcessed: enrichedStocks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
