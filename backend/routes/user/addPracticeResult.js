import { addPracticeResult } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ added token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify the request token
    verifyToken(event);

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
    console.error("❌ Error adding practice result:", err);

    // Handle token errors specifically
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { msg: "Error adding practice result", error: err.message });
  }
};
