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

    let filteredStocks = [];
    if (niftyData.isAboveEMA) {
      filteredStocks = await marketService.enrichStocksWithDayHigh(stocks);
    }

    const emailResult = await emailService.sendStockReport(filteredStocks, niftyData);
    return json({
      success: true,
      message: emailResult.skipped
        ? "Report generated. No shortlisted stocks, email skipped"
        : "Report generated and sent successfully",
      emailSent: !emailResult.skipped,
      niftyAboveEMA: niftyData.isAboveEMA,
      niftyPrice: niftyData.currentPrice,
      ema20: niftyData.ema20,
      stocksScraped: stocks.length,
      stocksIncluded: filteredStocks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
