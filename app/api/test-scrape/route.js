import ChartinkScraper from "../../../src/services/scraper.service";
import { ensureDb, getErrorResponse, json, requireUser } from "../_lib/server";

export async function GET(request) {
  try {
    await ensureDb();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const scraper = new ChartinkScraper();
    const stocks = await scraper.scrapeStocks();
    return json({
      success: true,
      count: stocks.length,
      stocks: stocks.slice(0, 25),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
