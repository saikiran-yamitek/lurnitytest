import { getWorkshopsByIncharge } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { empId } = event.pathParameters;
    const workshops = await getWorkshopsByIncharge(empId);
    return createResponse(200, workshops);
  } catch (err) {
    console.error("Error fetching workshops by incharge:", err);
    return createResponse(500, { error: err.message });
  }
};
