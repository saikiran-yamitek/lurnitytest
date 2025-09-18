import { generateMockQuestions } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
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
    return createResponse(500, { error: "Internal server error", detail: err.message });
  }
};
