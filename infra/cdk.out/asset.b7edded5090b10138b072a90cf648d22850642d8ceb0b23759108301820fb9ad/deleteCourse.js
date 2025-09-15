// backend/routes/admin/deleteCourse.js
import { deleteCourse } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const courseId = event.pathParameters?.id;
    if (!courseId) return { statusCode: 400, body: JSON.stringify({ error: "course id required" }) };

    await deleteCourse(courseId);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("deleteCourse error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
