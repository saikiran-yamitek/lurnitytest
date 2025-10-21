import { verifyRegisterOTP } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { phone, otp, sessionId } = JSON.parse(event.body || "{}");

    if (!phone || !otp || !sessionId) {
      return createResponse(400, { 
        message: "Phone, OTP, and sessionId are required" 
      });
    }

    // Verify OTP
    const verification = await verifyRegisterOTP(phone, otp, sessionId);

    if (!verification.valid) {
      return createResponse(400, { 
        message: verification.message || "Invalid or expired OTP",
        attemptsLeft: verification.attemptsLeft 
      });
    }

    return createResponse(200, { 
      message: "OTP verified successfully",
      verified: true 
    });
  } catch (err) {
    console.error("Error verifying registration OTP:", err);
    return createResponse(500, { message: err.message || "Failed to verify OTP" });
  }
};
