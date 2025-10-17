import { listCourses } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify JWT token before processing
    verifyToken(event);

    const limit = event.queryStringParameters?.limit
      ? Number(event.queryStringParameters.limit)
      : undefined;
    const lastKey = event.queryStringParameters?.lastKey
      ? JSON.parse(event.queryStringParameters.lastKey)
      : undefined;

    const result = await listCourses({ limit, lastKey });

    return createResponse(200, result);
  } catch (err) {
    console.error("❌ listCourses error:", err);

    // Return 401 if token is missing or invalid
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { error: err.message });
  }
};
