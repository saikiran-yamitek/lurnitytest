import { createEmployee } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    console.log("📨 Create employee request");
    
    const body = JSON.parse(event.body || "{}");
    console.log("📦 Employee data received:", { ...body, password: body.password ? "[REDACTED]" : "none" });

    const { name, email, username, password, role } = body;
    
    if (!name || !email || !username || !password) {
      return createResponse(400, { 
        message: "Name, email, username, and password are required" 
      });
    }

    if (password.length < 6) {
      return createResponse(400, { 
        message: "Password must be at least 6 characters long" 
      });
    }

    const newEmployee = await createEmployee(body);
    
    const responseEmployee = { ...newEmployee };
    delete responseEmployee.password;
    
    console.log("✅ Employee created successfully:", newEmployee.id);
    return createResponse(201, responseEmployee);
  } catch (err) {
    console.error("❌ Error creating employee:", err);
    return createResponse(500, { 
      message: "Server error creating employee",
      error: err.message 
    });
  }
};
