import { getEmployeeById } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters || {};
    const employee = await getEmployeeById(id);

    if (!employee) {
      return createResponse(404, { message: "Employee not found" });
    }

    // remove password before returning
    employee.password = "";

    return createResponse(200, employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    return createResponse(500, { message: "Server error fetching employee" });
  }
};
