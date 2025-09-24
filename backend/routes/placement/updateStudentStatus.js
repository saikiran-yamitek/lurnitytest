import { updateStudentStatus } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { driveId } = event.pathParameters; // keep driveId in path
    const body = JSON.parse(event.body);      // parse body
    const { studentId, ...statusData } = body; // get studentId from body and rest as statusData

    const result = await updateStudentStatus(driveId, studentId, statusData);
    return createResponse(200, result);
  } catch (err) {
    return createResponse(500, { message: err.message });
  }
};
