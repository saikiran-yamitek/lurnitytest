import { getUserGeminiKey } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ add token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify request token
    verifyToken(event);

    const body = JSON.parse(event.body || "{}");
    const { userId } = body;

    if (!userId) {
      return createResponse(400, { error: "userId is required" });
    }

    const geminiApiKey = await getUserGeminiKey(userId);

    if (!geminiApiKey) {
      return createResponse(404, { error: "User not found or no key saved" });
    }

    return createResponse(200, { geminiApiKey });
  } catch (err) {
    console.error("❌ Error fetching Gemini key:", err);

    // Handle token errors specifically
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Failed to fetch key" });
  }
};
