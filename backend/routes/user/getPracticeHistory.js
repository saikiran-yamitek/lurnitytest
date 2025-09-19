import { getPracticeHistory } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const userId = event.pathParameters?.id;
    if (!userId) {
      return createResponse(400, { msg: "userId required" });
    }

    // Parse body instead of query parameters
    const { courseId, subIdx, vidIdx } = JSON.parse(event.body || "{}");

    const history = await getPracticeHistory({ userId, courseId, subIdx, vidIdx });

    return createResponse(200, history);
  } catch (err) {
    return createResponse(500, { msg: "Error fetching practice history", error: err.message });
  }
};
