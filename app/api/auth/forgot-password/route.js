import authModule from "../../../../src/services/auth.service";
import { ensureDb, getErrorResponse, json, parseBody } from "../../_lib/server";

const { AuthService, MIN_PASSWORD_LENGTH } = authModule;

export async function POST(request) {
  try {
    await ensureDb();
    const body = await parseBody(request);
    const authService = new AuthService();
    await authService.forgotPassword({
      username: body.username,
      newPassword: body.newPassword,
    });

    return json({
      success: true,
      message: "Password reset successful. Please sign in again.",
      minPasswordLength: MIN_PASSWORD_LENGTH,
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
