import { listCourses } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const limit = event.queryStringParameters?.limit
      ? Number(event.queryStringParameters.limit)
      : undefined;
    const lastKey = event.queryStringParameters?.lastKey
      ? JSON.parse(event.queryStringParameters.lastKey)
      : undefined;

    const result = await listCourses({ limit, lastKey });

    return createResponse(200, result);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
