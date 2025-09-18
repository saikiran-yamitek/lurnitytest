// lambdas/feedback/submitFeedback.js
import { createFeedback } from "../../models/Feedback.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, courseId, subIndex, videoIndex, rating, comment } = body;

    const feedback = await createFeedback({
      userId,
      courseId,
      subIndex,
      videoIndex,
      rating,
      comment
    });

    return createResponse(201, { message: "Feedback saved successfully!", feedback });
  } catch (err) {
    console.error("Error saving feedback:", err);
    return createResponse(500, { error: "Failed to save feedback" });
  }
};
