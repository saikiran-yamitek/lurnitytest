import { generateMockQuestions } from "../../models/User.js";
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
    const { companyName, skills = [], userName = "Candidate", geminiApiKey } = body;

    if (!geminiApiKey) {
      return createResponse(400, { error: "Missing geminiApiKey" });
    }
    if (!companyName) {
      return createResponse(400, { error: "Missing companyName" });
    }

    const questions = await generateMockQuestions(companyName, skills, userName, geminiApiKey);

    return createResponse(200, { questions });

  } catch (err) {
    console.error("❌ mock-questions error:", err);

    // Handle token/authorization errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Internal server error", detail: err.message });
  }
};
