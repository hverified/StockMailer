import MarketDataService from "../../../../src/services/market.service";
import { getErrorResponse, json } from "../../_lib/server";

export async function GET(request, { params }) {
  try {
    const { symbol } = await params;
    if (!symbol) {
      return json({ success: false, error: "Stock symbol is required" }, { status: 400 });
    }

    const marketService = new MarketDataService();
    const quote = await marketService.getStockQuote(symbol);
    return json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: quote,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
