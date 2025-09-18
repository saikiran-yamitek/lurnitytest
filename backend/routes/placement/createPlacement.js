import { createPlacement } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const newDrive = await createPlacement(body);
    return createResponse(201, newDrive);
  } catch (err) {
    return createResponse(500, { message: err.message });
  }
};
