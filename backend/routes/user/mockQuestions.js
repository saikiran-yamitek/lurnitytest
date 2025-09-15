import { generateMockQuestions } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { companyName, skills = [], userName = "Candidate", geminiApiKey } = body;

    if (!geminiApiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing geminiApiKey" }),
      };
    }
    if (!companyName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing companyName" }),
      };
    }

    const questions = await generateMockQuestions(companyName, skills, userName, geminiApiKey);

    return {
      statusCode: 200,
      body: JSON.stringify({ questions }),
    };
  } catch (err) {
    console.error("❌ mock-questions error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", detail: err.message }),
    };
  }
};
