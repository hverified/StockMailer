import EmailService from "../../../src/services/email.service";
import { getErrorResponse, json } from "../_lib/server";

export async function POST() {
  try {
    const emailService = new EmailService();
    await emailService.sendTestEmail();
    return json({
      success: true,
      message: "Test email sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
