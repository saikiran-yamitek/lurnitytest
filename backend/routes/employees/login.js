import { getEmployeeByUsername, verifyEmployeePassword } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { username, password } = body;

    if (!username || !password) {
      return createResponse(400, { error: "Username & password required" });
    }

    // Fetch employee record
    const emp = await getEmployeeByUsername(username);
    if (!emp) {
      return createResponse(400, { error: "Invalid credentials" });
    }

    // Verify bcrypt password
    const ok = await verifyEmployeePassword(emp, password);
    if (!ok) {
      return createResponse(400, { error: "Invalid credentials" });
    }

    // Return limited employee details (don't send password hash)
    return createResponse(200, {
      id: emp.id,
      name: emp.name,
      role: emp.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return createResponse(500, { error: "Internal server error" });
  }
};
