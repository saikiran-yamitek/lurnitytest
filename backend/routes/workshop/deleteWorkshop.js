import { deleteWorkshop } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const result = await deleteWorkshop(id);
    return createResponse(200, result);
  } catch (err) {
    console.error("Delete workshop error:", err);
    return createResponse(500, { error: err.message });
  }
};
