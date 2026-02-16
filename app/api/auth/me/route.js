import { ensureDb, getCurrentUser, getErrorResponse, json } from "../../_lib/server";

export async function GET(request) {
  try {
    await ensureDb();
    const user = await getCurrentUser(request);
    if (!user) {
      return json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    return json({ success: true, user });
  } catch (error) {
    return getErrorResponse(error);
  }
}
