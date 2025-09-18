import { listEmployees } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const employees = await listEmployees();
    return createResponse(200, employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    return createResponse(500, { message: "Server error fetching employees" });
  }
};
