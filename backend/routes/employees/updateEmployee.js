import { updateEmployee } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verifier

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before allowing update
    verifyToken(event);

    const { id } = event.pathParameters || {};
    if (!id) {
      return createResponse(400, { message: "Employee ID is required" });
    }

    const body = JSON.parse(event.body || "{}");
    if (Object.keys(body).length === 0) {
      return createResponse(400, { message: "No update data provided" });
    }

    const updatedEmployee = await updateEmployee(id, body);

    if (!updatedEmployee) {
      return createResponse(404, { message: "Employee not found" });
    }

    // 🧹 Hide password before sending response
    if (updatedEmployee.password) delete updatedEmployee.password;

    return createResponse(200, updatedEmployee);
  } catch (err) {
    console.error("❌ Error updating employee:", err);

    // Token or auth error → 401
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { message: "Server error updating employee" });
  }
};
