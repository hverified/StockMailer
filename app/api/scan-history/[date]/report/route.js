import StockDBService from "../../../../../src/services/stock.db.service";
import DateUtil from "../../../../../src/utils/date.util";
import { ensureDb, getErrorResponse, json, requireUser } from "../../../_lib/server";

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
    const report = await stockDBService.getDateOutcomeReport(date);
    return json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
