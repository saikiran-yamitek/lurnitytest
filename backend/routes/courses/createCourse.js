import { createCourse } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const course = await createCourse(data);

    return createResponse(201, course);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
