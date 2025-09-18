import { updateStudentAttendance } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { studentId, ...updates } = body;

    const result = await updateStudentAttendance(id, studentId, updates);
    return createResponse(200, result);
  } catch (err) {
    console.error("Update attendance error:", err);
    return createResponse(500, { error: err.message });
  }
};
