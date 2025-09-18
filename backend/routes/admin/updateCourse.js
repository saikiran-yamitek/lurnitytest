// backend/routes/admin/updateCourse.js
import { updateCourse } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const courseId = event.pathParameters?.id;
    if (!courseId) return createResponse(400, { error: "course id required" });

    const body = event.body ? JSON.parse(event.body) : {};
    const updated = await updateCourse(courseId, body);
    if (!updated) return createResponse(404, { error: "Not found" });
    return createResponse(200, updated);
  } catch (err) {
    console.error("updateCourse error:", err);
    return createResponse(500, { error: err.message });
  }
};
