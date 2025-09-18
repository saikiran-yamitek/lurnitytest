// lambdas/feedback/deleteFeedback.js
import { deleteFeedback } from "../../models/Feedback.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;

    const result = await deleteFeedback(id);

    return createResponse(200, result);
  } catch (err) {
    console.error("Error deleting feedback:", err);
    return createResponse(500, { error: "Failed to delete feedback" });
  }
};
