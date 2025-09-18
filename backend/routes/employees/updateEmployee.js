import { updateEmployee } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");

    const updatedEmployee = await updateEmployee(id, body);

    if (!updatedEmployee) {
      return createResponse(404, { message: "Employee not found" });
    }

    return createResponse(200, updatedEmployee);
  } catch (err) {
    console.error("Error updating employee:", err);
    return createResponse(500, { message: "Server error updating employee" });
  }
};
