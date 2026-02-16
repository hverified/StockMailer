import StockDBService from "../../../../../../../src/services/stock.db.service";
import DateUtil from "../../../../../../../src/utils/date.util";
import { ensureDb, getErrorResponse, json, parseBody, requireUser } from "../../../../../_lib/server";

export async function PATCH(request, { params }) {
  try {
    await ensureDb();
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const { date, symbol } = await params;
    const { triggeredStatus, pnlStatus } = await parseBody(request);

    if (!DateUtil.isValidDateFormat(date)) {
      return json({ success: false, error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }
    if (!symbol) {
      return json({ success: false, error: "Stock symbol is required" }, { status: 400 });
    }

    const allowedTriggered = ["triggered", "not_triggered", "unmarked"];
    const allowedPnl = ["profit", "loss", "unmarked"];

    if (triggeredStatus !== undefined && !allowedTriggered.includes(triggeredStatus)) {
      return json(
        { success: false, error: "triggeredStatus must be one of: triggered, not_triggered, unmarked" },
        { status: 400 }
      );
    }
    if (pnlStatus !== undefined && !allowedPnl.includes(pnlStatus)) {
      return json({ success: false, error: "pnlStatus must be one of: profit, loss, unmarked" }, { status: 400 });
    }
    if (triggeredStatus === undefined && pnlStatus === undefined) {
      return json(
        { success: false, error: "At least one field is required: triggeredStatus or pnlStatus" },
        { status: 400 }
      );
    }

    const stockDBService = new StockDBService();
    const updated = await stockDBService.updateStockOutcome(symbol.toUpperCase(), date, {
      triggeredStatus,
      pnlStatus,
    });

    if (!updated) {
      return json(
        { success: false, error: `Stock ${symbol.toUpperCase()} not found for date ${date}` },
        { status: 404 }
      );
    }

    const report = await stockDBService.getDateOutcomeReport(date);
    return json({
      success: true,
      message: "Stock outcome updated successfully",
      date,
      symbol: symbol.toUpperCase(),
      stock: updated,
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
