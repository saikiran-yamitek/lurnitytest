import { saveUserGeminiKey } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, geminiApiKey } = body;

    if (!userId || !geminiApiKey) {
      return createResponse(400, { error: "userId and geminiApiKey are required" });
    }

    const result = await saveUserGeminiKey(userId, geminiApiKey);
    return createResponse(200, result);
  } catch (err) {
    console.error("❌ Error saving Gemini key:", err);
    return createResponse(500, { error: "Failed to save key" });
  }
};
