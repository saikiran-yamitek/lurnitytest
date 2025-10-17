// backend/routes/admin/listCourses.js
import { listCourses } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    verifyToken(event);
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? Number(qs.limit) : undefined;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;

    const res = await listCourses({ limit, lastKey });
    return createResponse(200, res);
  } catch (err) {
    console.error("listCourses error:", err);
    const statusCode =
      err.message.includes("token") || err.message.includes("Authorization")
        ? 401
        : 500;

    return createResponse(statusCode, { error: err.message });
  }
};
