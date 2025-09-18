// user/googleLogin.js

import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { findUserByEmail } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID ||
    "322821846367-514od8575kmib97gji4q88ntskndmo9b.apps.googleusercontent.com"
);
const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { token } = body;

    if (!token) {
      return createResponse(400, { success: false, msg: "Token required" });
    }

    // 1) Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // 2) Lookup user
    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      return createResponse(200, { success: false, msg: "User not registered" });
    }

    // 3) Create app token
    const appToken = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return createResponse(200, {
      success: true,
      token: appToken,
      user: { id: existingUser.id, email: existingUser.email },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return createResponse(400, { success: false, msg: "Invalid Google login" });
  }
};
