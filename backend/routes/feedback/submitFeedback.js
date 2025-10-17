// lambdas/feedback/submitFeedback.js
import { createFeedback } from "../../models/Feedback.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before processing request
    verifyToken(event);

    const body = JSON.parse(event.body || "{}");
    const { userId, courseId, subIndex, videoIndex, rating, comment } = body;

    if (!userId || !courseId || rating === undefined) {
      return createResponse(400, { error: "Missing required fields" });
    }

    const feedback = await createFeedback({
      userId,
      courseId,
      subIndex,
      videoIndex,
      rating,
      comment,
    });

    return createResponse(201, {
      message: "Feedback saved successfully!",
      feedback,
    });
  } catch (err) {
    console.error("Error saving feedback:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Failed to save feedback" });
  }
};
