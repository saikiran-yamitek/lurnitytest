// backend/routes/admin/updateCourse.js
import { updateCourse } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const courseId = event.pathParameters?.id;
    if (!courseId) return { statusCode: 400, body: JSON.stringify({ error: "course id required" }) };

    const body = event.body ? JSON.parse(event.body) : {};
    const updated = await updateCourse(courseId, body);
    if (!updated) return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    return { statusCode: 200, body: JSON.stringify(updated) };
  } catch (err) {
    console.error("updateCourse error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
