import StockDBService from "../../../../src/services/stock.db.service";
import DateUtil from "../../../../src/utils/date.util";
import { ensureDb, getErrorResponse, json, requireUser } from "../../_lib/server";

export async function GET(request, { params }) {
  try {
    await ensureDb();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const { date } = await params;
    if (!DateUtil.isValidDateFormat(date)) {
      return json({ success: false, error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    const stockDBService = new StockDBService();
    const stocks = await stockDBService.getStocksByDate(date);

    if (!stocks || stocks.length === 0) {
      return json({
        success: true,
        message: "No stocks found for this date",
        stocks: [],
        niftyData: null,
        date,
        timestamp: new Date().toISOString(),
      });
    }

    const niftyData = stocks[0].niftyData || null;
    return json({
      success: true,
      count: stocks.length,
      stocks,
      niftyData,
      date,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
