import { deletePlacement } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const result = await deletePlacement(id);
    return createResponse(200, result);
  } catch (err) {
    return createResponse(500, { message: err.message });
  }
};
