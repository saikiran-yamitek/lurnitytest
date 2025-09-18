import { updateStudentStatus } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { driveId, studentId } = event.pathParameters;
    const body = JSON.parse(event.body);

    const result = await updateStudentStatus(driveId, studentId, body);
    return createResponse(200, result);
  } catch (err) {
    return createResponse(500, { message: err.message });
  }
};
