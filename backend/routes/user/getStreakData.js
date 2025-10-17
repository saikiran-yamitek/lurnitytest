import { getStreakData } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token from headers
    verifyToken(event);

    // Prefer path parameter first, fallback to query
    const userId = event.pathParameters?.id || event.queryStringParameters?.userId;
    if (!userId) {
      return createResponse(400, { msg: "userId required" });
    }

    const streakData = await getStreakData(userId);

    return createResponse(200, {
      msg: "Streak data fetched successfully",
      streakData
    });

  } catch (err) {
    console.error("❌ Error fetching streak data:", err);

    // Handle token/authorization errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { msg: "Error fetching streak data", error: err.message });
  }
};
