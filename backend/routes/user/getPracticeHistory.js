import { getPracticeHistory } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ add token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify the request token
    verifyToken(event);

    const userId = event.pathParameters?.id;
    if (!userId) {
      return createResponse(400, { msg: "userId required" });
    }

    // Parse body instead of query parameters
    const { courseId, subIdx, vidIdx } = JSON.parse(event.body || "{}");

    const history = await getPracticeHistory({ userId, courseId, subIdx, vidIdx });

    return createResponse(200, history);
  } catch (err) {
    console.error("❌ Error fetching practice history:", err);

    // Handle token errors specifically
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { msg: "Error fetching practice history", error: err.message });
  }
};
