import { addCompletedSubcourse } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, subCourseTitle } = body;

    const updated = await addCompletedSubcourse(userId, subCourseTitle);
    if (!updated) return { statusCode: 404, body: JSON.stringify({ error: "User not found" }) };

    return { statusCode: 200, body: JSON.stringify({ message: "Completed subcourse updated", completedSubcourses: updated.completedSubcourses }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
