import authModule from "../../../../src/services/auth.service";
import {
  ensureDb,
  getCookieOptions,
  getErrorResponse,
  json,
  parseBody,
} from "../../_lib/server";

const { AuthService, MIN_PASSWORD_LENGTH, SESSION_COOKIE_NAME } = authModule;

export async function POST(request) {
  try {
    await ensureDb();
    const body = await parseBody(request);
    const authService = new AuthService();

    const result = await authService.signin({
      username: body.username,
      password: body.password,
      rememberMe: body.rememberMe !== false,
      userAgent: request.headers.get("user-agent"),
    });

    const response = json({
      success: true,
      message: "Signin successful",
      minPasswordLength: MIN_PASSWORD_LENGTH,
      user: result.user,
    });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      result.session.token,
      getCookieOptions(result.session.expiresAt)
    );
    return response;
  } catch (error) {
    return getErrorResponse(error);
  }
}
