import { deleteEmployee } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify JWT token before processing
    verifyToken(event);

    const { id } = event.pathParameters || {};
    if (!id) {
      return createResponse(400, { error: "Employee ID required" });
    }

    await deleteEmployee(id);

    return createResponse(200, { ok: true });
  } catch (err) {
    console.error("Error deleting employee:", err);

    // Return 401 if token is missing or invalid
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { message: "Server error deleting employee" });
  }
};
