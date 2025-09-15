// lambdas/feedback/submitFeedback.js
import { createFeedback } from "../../models/Feedback.js";

export const handler = async (event) => {
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

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Feedback saved successfully!", feedback }),
    };
  } catch (err) {
    console.error("Error saving feedback:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save feedback" }),
    };
  }
};
