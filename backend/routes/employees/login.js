import { getEmployeeByUsername, verifyEmployeePassword } from "../../models/Employee.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Username & password required" }),
      };
    }

    // Fetch employee record
    const emp = await getEmployeeByUsername(username);
    if (!emp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // Verify bcrypt password
    const ok = await verifyEmployeePassword(emp, password);
    if (!ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // Return limited employee details (don’t send password hash)
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: emp.id,
        name: emp.name,
        role: emp.role,
      }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
