import { saveUserGeminiKey } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, geminiApiKey } = body;

    if (!userId || !geminiApiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId and geminiApiKey are required" }),
      };
    }

    const result = await saveUserGeminiKey(userId, geminiApiKey);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("❌ Error saving Gemini key:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save key" }),
    };
  }
};
