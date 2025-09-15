import { updateCourseCompletion } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, courseCompletion } = body;

    const updated = await updateCourseCompletion(userId, courseCompletion);
    return { statusCode: 200, body: JSON.stringify(updated) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error updating course completion", error: err.message }) };
  }
};
