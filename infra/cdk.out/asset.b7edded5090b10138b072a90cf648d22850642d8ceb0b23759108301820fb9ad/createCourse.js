// backend/routes/admin/createCourse.js
import { createCourse } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const created = await createCourse(payload);
    return { statusCode: 201, body: JSON.stringify(created) };
  } catch (err) {
    console.error("createCourse error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
