import { updateCourse } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify JWT token before processing
    verifyToken(event);

    const id = event.pathParameters?.id;
    if (!id) {
      return createResponse(400, { error: "id is required" });
    }

    const data = JSON.parse(event.body || "{}");
    const updated = await updateCourse(id, data);

    if (!updated) {
      return createResponse(404, { error: "Not found" });
    }

    return createResponse(200, updated);
  } catch (err) {
    console.error("❌ updateCourse error:", err);

    // Return 401 if token is missing or invalid
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { error: err.message });
  }
};
