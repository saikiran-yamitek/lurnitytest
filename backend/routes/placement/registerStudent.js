import { registerStudent } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const { studentId } = JSON.parse(event.body);

    if (!studentId) {
      return createResponse(400, { message: "Student ID is required" });
    }

    const result = await registerStudent(id, studentId);
    return createResponse(200, result);
  } catch (err) {
    return createResponse(500, { message: err.message });
  }
};
