import { addCompletedSubcourse } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, subCourseTitle } = body;

    const updated = await addCompletedSubcourse(userId, subCourseTitle);
    if (!updated) {
      return createResponse(404, { error: "User not found" });
    }

    return createResponse(200, { 
      message: "Completed subcourse updated", 
      completedSubcourses: updated.completedSubcourses 
    });
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
