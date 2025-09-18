import { getWorkshopStudents } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const students = await getWorkshopStudents(id);
    return createResponse(200, students);
  } catch (err) {
    console.error("Error fetching workshop students:", err);
    return createResponse(500, { error: err.message });
  }
};
