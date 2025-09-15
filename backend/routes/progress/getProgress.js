// GET /api/progress
// expects Authorization: "Bearer <token>"
import { verifyJwt, getWatchedVideos } from "../../models/User.js";

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

    const watched = await getWatchedVideos(userId);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(watched || []),
    };
  } catch (err) {
    console.error("getProgress error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch progress" }),
    };
  }
};
