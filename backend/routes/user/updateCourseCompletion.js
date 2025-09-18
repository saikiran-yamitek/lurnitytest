import { updateCourseCompletion } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, courseCompletion } = body;

    const updated = await updateCourseCompletion(userId, courseCompletion);
    return createResponse(200, updated);
  } catch (err) {
    return createResponse(500, { msg: "Error updating course completion", error: err.message });
  }
};
