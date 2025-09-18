import { updateCourse } from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return createResponse(400, { error: "id is required" });
    }

    const data = JSON.parse(event.body || "{}");
    const updated = await updateCourse(id, data);

    if (!updated) {
      return createResponse(404, { error: "Not found" });
    }

    return createResponse(200, updated);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
