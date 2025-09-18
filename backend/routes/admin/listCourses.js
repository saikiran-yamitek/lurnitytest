// backend/routes/admin/listCourses.js
import { listCourses } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? Number(qs.limit) : undefined;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;

    const res = await listCourses({ limit, lastKey });
    return createResponse(200, res);
  } catch (err) {
    console.error("listCourses error:", err);
    return createResponse(500, { error: err.message });
  }
};
