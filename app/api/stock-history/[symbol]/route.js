import StockDBService from "../../../../src/services/stock.db.service";
import { ensureDb, getErrorResponse, json, requireUser } from "../../_lib/server";

export async function GET(request, { params }) {
  try {
    await ensureDb();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!symbol) {
      return json({ success: false, error: "Stock symbol is required" }, { status: 400 });
    }
    if (Number.isNaN(limit) || limit < 1 || limit > 50) {
      return json({ success: false, error: "Limit must be between 1 and 50" }, { status: 400 });
    }

    const stockDBService = new StockDBService();
    const history = await stockDBService.getStockHistory(symbol.toUpperCase(), limit);

    if (!history || history.length === 0) {
      return json({
        success: true,
        message: `No history found for ${symbol}`,
        symbol: symbol.toUpperCase(),
        history: [],
        timestamp: new Date().toISOString(),
      });
    }

    return json({
      success: true,
      symbol: symbol.toUpperCase(),
      count: history.length,
      history,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
