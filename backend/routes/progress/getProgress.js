// GET /api/progress
// expects Authorization: "Bearer <token>"
import { verifyJwt, getWatchedVideos } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const headers = event.headers || {};
    const auth = headers.Authorization || headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return createResponse(401, { error: "No token" });
    }

    const token = auth.split(" ")[1];
    let payload;
    try {
      payload = verifyJwt(token);
    } catch (err) {
      return createResponse(401, { error: "Invalid token" });
    }

    const userId = payload?.id;
    if (!userId) {
      return createResponse(401, { error: "Invalid token payload" });
    }

    const watched = await getWatchedVideos(userId);
    return createResponse(200, watched || []);
  } catch (err) {
    console.error("getProgress error:", err);
    return createResponse(500, { error: "Failed to fetch progress" });
  }
};
