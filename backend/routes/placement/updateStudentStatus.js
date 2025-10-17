import { updateStudentStatus } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verifier

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before proceeding
    verifyToken(event);

    const { id } = event.pathParameters; // driveId
    const body = JSON.parse(event.body || "{}");
    const { studentId, ...statusData } = body;

    if (!studentId) {
      return createResponse(400, { message: "Student ID is required" });
    }

    const result = await updateStudentStatus(id, studentId, statusData);

    return createResponse(200, result);
  } catch (err) {
    console.error("❌ Error updating student status:", err);

    // ✅ Handle unauthorized access cleanly
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: "Server error updating student status", error: err.message });
  }
};
