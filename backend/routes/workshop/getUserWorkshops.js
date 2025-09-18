import { getUserWorkshops } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { userId } = event.pathParameters;
    const workshops = await getUserWorkshops(userId);
    return createResponse(200, workshops);
  } catch (err) {
    console.error("Error fetching user workshops:", err);
    return createResponse(500, { error: err.message });
  }
};
