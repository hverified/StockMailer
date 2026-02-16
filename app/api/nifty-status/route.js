import MarketDataService from "../../../src/services/market.service";
import { ensureDb, getErrorResponse, json, requireUser } from "../_lib/server";

export async function GET(request) {
  try {
    await ensureDb();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const marketService = new MarketDataService();
    const niftyData = await marketService.getNifty50Data();

    return json({
      success: true,
      price: niftyData.currentPrice,
      ema20: niftyData.ema20,
      aboveEMA: niftyData.isAboveEMA,
      difference: (niftyData.currentPrice - niftyData.ema20).toFixed(2),
      differencePercent: (
        ((niftyData.currentPrice - niftyData.ema20) / niftyData.ema20) *
        100
      ).toFixed(2),
      timestamp: niftyData.timestamp,
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
