import { addCompletedSubcourse } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token from headers
    verifyToken(event);

    const body = JSON.parse(event.body || "{}");
    const { userId, subCourseTitle } = body;

    if (!userId || !subCourseTitle) {
      return createResponse(400, { error: "userId and subCourseTitle are required" });
    }

    const updated = await addCompletedSubcourse(userId, subCourseTitle);

    if (!updated) {
      return createResponse(404, { error: "User not found" });
    }

    return createResponse(200, { 
      message: "Completed subcourse updated", 
      completedSubcourses: updated.completedSubcourses 
    });

  } catch (err) {
    console.error("❌ Error updating completed subcourse:", err);

    // Handle token errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: err.message });
  }
};
