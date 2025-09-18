import { listWorkshops } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const workshops = await listWorkshops();
    return createResponse(200, workshops);
  } catch (err) {
    console.error("Failed to list workshops:", err);
    return createResponse(500, { error: err.message });
  }
};
