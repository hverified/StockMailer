import EmailService from "../../../src/services/email.service";
import { getErrorResponse, json } from "../_lib/server";

export async function POST() {
  try {
    const emailService = new EmailService();
    await emailService.sendTestMorningEmail();
    return json({
      success: true,
      message: "Test morning email sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return getErrorResponse(error);
  }
}
