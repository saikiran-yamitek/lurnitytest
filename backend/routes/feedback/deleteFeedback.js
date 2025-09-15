// lambdas/feedback/deleteFeedback.js
import { deleteFeedback } from "../../models/Feedback.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;

    const result = await deleteFeedback(id);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("Error deleting feedback:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete feedback" }),
    };
  }
};
