// backend/routes/admin/createCourse.js
import { createCourse } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const created = await createCourse(payload);
    return createResponse(201, created);
  } catch (err) {
    console.error("createCourse error:", err);
    return createResponse(500, { error: err.message });
  }
};
