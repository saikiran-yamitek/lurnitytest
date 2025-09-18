// lambdas/feedback/listFeedbacks.js
import { listFeedbacks } from "../../models/Feedback.js";
import { getUserName } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    let feedbacks = await listFeedbacks();

    // Populate user name like Mongoose `.populate()`
    for (let fb of feedbacks) {
      fb.userName = await getUserName(fb.userId);
    }

    // Sort by createdAt descending
    feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return createResponse(200, feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    return createResponse(500, { error: "Failed to fetch feedbacks" });
  }
};
