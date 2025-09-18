import { saveQuestion } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, question, correctAnswer } = body;

    await saveQuestion(userId, question, correctAnswer);
    return createResponse(200, { msg: "Question saved" });
  } catch (err) {
    return createResponse(500, { msg: "Error saving question", error: err.message });
  }
};
