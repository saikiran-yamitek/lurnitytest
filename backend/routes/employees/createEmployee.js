import { createEmployee } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const newEmployee = await createEmployee(body);

    return createResponse(201, newEmployee);
  } catch (err) {
    console.error("Error creating employee:", err);
    return createResponse(500, { message: "Server error creating employee" });
  }
};
