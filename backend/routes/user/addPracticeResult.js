import { addPracticeResult } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const userId = event.pathParameters?.id;
    if (!userId) return createResponse(400, { error: "user id required" });

    // Safely parse body
    const body = event.body ? JSON.parse(event.body) : {};

    // Validate required fields (accept 0 as valid)
    const { courseId, subIdx, vidIdx, ...rest } = body;
    if (courseId == null || subIdx == null || vidIdx == null) {
      return createResponse(400, { error: "courseId, subIdx, and vidIdx are required" });
    }

    // Add practice result
    const updated = await addPracticeResult(userId, body);

    return createResponse(200, { practiceHistory: updated });
  } catch (err) {
    console.error("Error saving practice result:", err);
    return createResponse(500, { msg: "Error adding practice result", error: err.message });
  }
};
