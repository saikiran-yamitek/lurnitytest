import { getEmployeeById } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import the token verifier

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token first
    verifyToken(event);

    const { id } = event.pathParameters || {};
    if (!id) {
      return createResponse(400, { message: "Employee ID is required" });
    }

    const employee = await getEmployeeById(id);

    if (!employee) {
      return createResponse(404, { message: "Employee not found" });
    }

    // 🧹 Remove password before returning
    employee.password = "";

    return createResponse(200, employee);
  } catch (err) {
    console.error("❌ Error fetching employee:", err);

    // Return 401 if token issue
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { message: "Server error fetching employee" });
  }
};
