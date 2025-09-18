import { createWorkshop } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const newWorkshop = await createWorkshop(body);
    return createResponse(201, newWorkshop);
  } catch (err) {
    console.error("Workshop creation error:", err);
    return createResponse(500, { error: err.message });
  }
};
