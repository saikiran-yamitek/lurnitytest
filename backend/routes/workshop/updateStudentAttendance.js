import { updateStudentAttendance } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // Auth utility

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify authorization token
    verifyToken(event);

    const workshopId = event.pathParameters?.id;
    if (!workshopId) {
      return createResponse(400, { error: "Workshop ID is required in path parameters" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const studentId = body.studentId;
    if (!studentId) {
      return createResponse(400, { error: "studentId is required in request body" });
    }

    const updates = { ...body };
    delete updates.studentId; // Remove studentId from updates to avoid conflicts

    console.log(`🔍 Updating attendance for student ${studentId} in workshop ${workshopId}`);
    const result = await updateStudentAttendance(workshopId, studentId, updates);

    return createResponse(200, { message: "Attendance updated successfully", result });

  } catch (err) {
    console.error("❌ Update attendance error:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Failed to update attendance", details: err.message });
  }
};
