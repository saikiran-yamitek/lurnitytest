import { addPracticeResult } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, result } = body;

    const updated = await addPracticeResult(userId, result);
    return createResponse(200, { practiceHistory: updated });
  } catch (err) {
    return createResponse(500, { msg: "Error adding practice result", error: err.message });
  }
};
