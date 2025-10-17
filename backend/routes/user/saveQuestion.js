import { saveQuestion } from "../../models/User.js";
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

    console.log("📨 Raw event body:", event.body);
    
    const body = JSON.parse(event.body || "{}");
    console.log("📦 Parsed body:", JSON.stringify(body, null, 2));
    
    const { userId, question, correctOption, options } = body;
    
    // Validation
    if (!userId || !question || correctOption === undefined || !options) {
      return createResponse(400, { 
        msg: "userId, question, correctOption, and options are required" 
      });
    }

    console.log("🚀 Saving question for user:", userId);

    // Pass correctOption to your saveQuestion function
    await saveQuestion(userId, question, correctOption, options);

    console.log("✅ Question saved successfully");
    return createResponse(200, { msg: "Question saved" });

  } catch (err) {
    console.error("❌ Error saving question:", err);

    // Handle token errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { msg: "Error saving question", error: err.message });
  }
};
