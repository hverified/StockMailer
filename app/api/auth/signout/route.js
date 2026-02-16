import authModule from "../../../../src/services/auth.service";
import { ensureDb, getCookieOptions, getErrorResponse, json } from "../../_lib/server";

const { AuthService, SESSION_COOKIE_NAME } = authModule;

export async function POST(request) {
  try {
    await ensureDb();
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authService = new AuthService();
    await authService.signout(token);

    const response = json({
      success: true,
      message: "Signed out successfully",
    });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      ...getCookieOptions(),
      expires: new Date(0),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return getErrorResponse(error);
  }
}
