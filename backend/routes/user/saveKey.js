import { saveUserGeminiKey } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token from headers
    verifyToken(event);

    const body = JSON.parse(event.body || "{}");
    const { userId, geminiApiKey } = body;

    if (!userId || !geminiApiKey) {
      return createResponse(400, { error: "userId and geminiApiKey are required" });
    }

    const result = await saveUserGeminiKey(userId, geminiApiKey);
    return createResponse(200, { message: "Gemini key saved successfully", result });

  } catch (err) {
    console.error("❌ Error saving Gemini key:", err);

    // Handle token/authorization errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Failed to save key", detail: err.message });
  }
};
