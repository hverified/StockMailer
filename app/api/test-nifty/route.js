import MarketDataService from "../../../src/services/market.service";
import { ensureDb, getErrorResponse, json } from "../_lib/server";

export async function GET() {
  try {
    await ensureDb();
    const marketService = new MarketDataService();
    const niftyData = await marketService.getNifty50Data();
    return json({
      success: true,
      data: niftyData,
      message: niftyData.isAboveEMA ? "Nifty is above 20 EMA" : "Nifty is below 20 EMA",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
