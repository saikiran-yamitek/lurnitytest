// backend/routes/admin/updateCourse.js
import { updateCourse } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before proceeding
    verifyToken(event);

    // ✅ Check for courseId in path
    const courseId = event.pathParameters?.id;
    if (!courseId) return createResponse(400, { error: "course id required" });

    // ✅ Parse body and update course
    const body = event.body ? JSON.parse(event.body) : {};
    const updated = await updateCourse(courseId, body);
    if (!updated) return createResponse(404, { error: "Not found" });

    return createResponse(200, updated);
  } catch (err) {
    console.error("updateCourse error:", err);

    // ✅ Return 401 if token issue, else 500
    const statusCode =
      err.message.includes("token") || err.message.includes("Authorization")
        ? 401
        : 500;

    return createResponse(statusCode, { error: err.message });
  }
};
