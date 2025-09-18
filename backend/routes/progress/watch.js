// POST /api/progress/watch
// body: { "videoId": "COURSE|sub|vid" }
// expects Authorization: "Bearer <token>"
import { verifyJwt, addWatchedVideo } from "../../models/User.js";
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

    // parse body (API Gateway proxy may send string)
    let body = event.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return createResponse(400, { error: "Invalid JSON body" });
      }
    }

    const videoId = body?.videoId;
    if (!videoId) {
      return createResponse(400, { error: "videoId required" });
    }

    try {
      const result = await addWatchedVideo(userId, videoId);
      return createResponse(200, { ok: true, result });
    } catch (err) {
      // if user not found or other validation errors
      console.error("addWatchedVideo error:", err);
      return createResponse(400, { error: err.message || "Failed to update progress" });
    }
  } catch (err) {
    console.error("watch progress error:", err);
    return createResponse(500, { error: "Failed to update progress" });
  }
};
