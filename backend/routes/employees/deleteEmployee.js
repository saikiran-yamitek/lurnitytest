import { deleteEmployee } from "../../models/Employee.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters || {};
    await deleteEmployee(id);

    return createResponse(200, { ok: true });
  } catch (err) {
    console.error("Error deleting employee:", err);
    return createResponse(500, { message: "Server error deleting employee" });
  }
};
