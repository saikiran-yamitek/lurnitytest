import { listDemos } from "../../models/Demo.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const demos = await listDemos();

    return createResponse(200, demos);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
