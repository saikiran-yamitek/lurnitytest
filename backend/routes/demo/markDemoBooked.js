import { markDemoBooked } from "../../models/Demo.js";
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

    const updated = await markDemoBooked(id);

    return createResponse(200, { message: "Demo marked as booked", demo: updated });
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
