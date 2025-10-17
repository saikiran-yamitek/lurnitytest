// backend/routes/admin/createCourse.js
import { createCourse } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js";


export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    verifyToken(event);
    const payload = event.body ? JSON.parse(event.body) : {};
    const created = await createCourse(payload);
    return createResponse(201, created);
  } catch (err) {
    console.error("createCourse error:", err);
    const statusCode = err.message.includes("token") || err.message.includes("Authorization") ? 401 : 500;
    return createResponse(statusCode, { error: err.message });
  }
};
