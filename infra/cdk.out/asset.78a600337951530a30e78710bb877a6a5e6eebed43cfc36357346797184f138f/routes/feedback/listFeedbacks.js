// lambdas/feedback/listFeedbacks.js
import { listFeedbacks } from "../../models/Feedback.js";
import { getUserName } from "../../models/User.js";

export const handler = async () => {
  try {
    let feedbacks = await listFeedbacks();

    // Populate user name like Mongoose `.populate()`
    for (let fb of feedbacks) {
      fb.userName = await getUserName(fb.userId);
    }

    // Sort by createdAt descending
    feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      body: JSON.stringify(feedbacks),
    };
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch feedbacks" }),
    };
  }
};
