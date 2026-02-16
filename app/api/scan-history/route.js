import StockDBService from "../../../src/services/stock.db.service";
import { ensureDb, getErrorResponse, json, requireUser } from "../_lib/server";

export async function GET(request) {
  try {
    await ensureDb();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      return json({ success: false, error: "Limit must be between 1 and 100" }, { status: 400 });
    }

    const stockDBService = new StockDBService();
    const dates = await stockDBService.getAllScanDates(limit);
    return json({
      success: true,
      count: dates.length,
      dates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
