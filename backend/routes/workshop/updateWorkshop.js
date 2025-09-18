import { updateWorkshop } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    const updated = await updateWorkshop(id, body);
    return createResponse(200, updated);
  } catch (err) {
    console.error("Workshop update error:", err);
    return createResponse(500, { error: err.message });
  }
};
