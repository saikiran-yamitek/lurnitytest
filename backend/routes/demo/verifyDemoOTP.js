import { verifyDemoOTP, sendThankYouSMS } from "../../models/Demo.js";

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  try {
    const { phone, otp, sessionId } = JSON.parse(event.body || "{}");

    if (!phone || !otp || !sessionId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: "Phone, OTP, and sessionId are required" })
      };
    }

    // Verify OTP
    const verification = await verifyDemoOTP(phone, otp, sessionId);

    if (!verification.valid) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: verification.message || "Invalid or expired OTP",
          attemptsLeft: verification.attemptsLeft 
        })
      };
    }

    // Send thank you SMS after successful verification
    await sendThankYouSMS(phone);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: "OTP verified successfully",
        verified: true 
      })
    };
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: err.message })
    };
  }
};
