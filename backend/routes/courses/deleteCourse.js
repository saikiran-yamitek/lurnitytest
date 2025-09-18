import { deleteCourse } from "../../models/Course.js";
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

    await deleteCourse(id);

    return createResponse(204, "");
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
