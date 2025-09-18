// backend/routes/admin/deleteCourse.js
import { deleteCourse } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const courseId = event.pathParameters?.id;
    if (!courseId) return createResponse(400, { error: "course id required" });

    await deleteCourse(courseId);
    return createResponse(200, { success: true });
  } catch (err) {
    console.error("deleteCourse error:", err);
    return createResponse(500, { error: err.message });
  }
};
