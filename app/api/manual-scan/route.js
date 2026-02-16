import ChartinkScraper from "../../../src/services/scraper.service";
import MarketDataService from "../../../src/services/market.service";
import StockDBService from "../../../src/services/stock.db.service";
import { ensureDb, getErrorResponse, json, requireUser } from "../_lib/server";

export async function POST(request) {
  try {
    await ensureDb();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const scraper = new ChartinkScraper();
    const marketService = new MarketDataService();
    const stockDBService = new StockDBService();

    const niftyData = await marketService.getNifty50Data();
    const stocks = await scraper.scrapeStocks();

    let filteredStocks = [];
    if (niftyData.isAboveEMA) {
      filteredStocks = await marketService.enrichStocksWithDayHigh(stocks);
    }

    await stockDBService.saveStocks(filteredStocks, niftyData);

    return json({
      success: true,
      message: "Manual scan completed successfully",
      stocksScraped: stocks.length,
      stocksSaved: filteredStocks.length,
      niftyData: {
        currentPrice: niftyData.currentPrice,
        ema20: niftyData.ema20,
        isAboveEMA: niftyData.isAboveEMA,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
