// POST /api/progress/watch
// body: { "videoId": "COURSE|sub|vid" }
// expects Authorization: "Bearer <token>"
import { verifyJwt, addWatchedVideo } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const headers = event.headers || {};
    const auth = headers.Authorization || headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No token" }),
      };
    }

    const token = auth.split(" ")[1];
    let payload;
    try {
      payload = verifyJwt(token);
    } catch (err) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid token" }),
      };
    }

    const userId = payload?.id;
    if (!userId) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid token payload" }),
      };
    }

    // parse body (API Gateway proxy may send string)
    let body = event.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid JSON body" }),
        };
      }
    }

    const videoId = body?.videoId;
    if (!videoId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "videoId required" }),
      };
    }

    try {
      const result = await addWatchedVideo(userId, videoId);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, result }),
      };
    } catch (err) {
      // if user not found or other validation errors
      console.error("addWatchedVideo error:", err);
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: err.message || "Failed to update progress" }),
      };
    }
  } catch (err) {
    console.error("watch progress error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to update progress" }),
    };
  }
};
