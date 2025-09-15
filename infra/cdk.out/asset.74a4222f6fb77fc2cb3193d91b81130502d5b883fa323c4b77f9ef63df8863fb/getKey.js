import { getUserGeminiKey } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { userId } = body;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId is required" }),
      };
    }

    const geminiApiKey = await getUserGeminiKey(userId);

    if (!geminiApiKey) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found or no key saved" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ geminiApiKey }),
    };
  } catch (err) {
    console.error("❌ Error fetching Gemini key:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch key" }),
    };
  }
};