import { getEmployeeByUsername, verifyEmployeePassword } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import jwt from "jsonwebtoken";

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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: emp.id,
        role: emp.role,
        username: emp.username,
      },
      process.env.JWT_SECRET,   // your server-side secret
      { expiresIn: '1d' }      // 1 day expiry
    );

    // Return limited employee details + token
    return createResponse(200, {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      token,    // <-- newly added token
    });
  } catch (err) {
    console.error("Login error:", err);
    return createResponse(500, { error: "Internal server error" });
  }
};
