import { registerStudent } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Check for valid token
    verifyToken(event);

    const { id } = event.pathParameters;
    const { studentId } = JSON.parse(event.body || "{}");

    if (!studentId) {
      return createResponse(400, { message: "Student ID is required" });
    }

    const result = await registerStudent(id, studentId);
    return createResponse(200, result);
  } catch (err) {
    console.error("❌ Error registering student:", err);

    // ✅ Handle unauthorized cases
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: "Server error registering student", error: err.message });
  }
};
