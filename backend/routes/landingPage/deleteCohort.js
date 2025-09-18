import { deleteCohort } from "../../models/LandingPage.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;

    const result = await deleteCohort(id);
    if (!result) {
      return createResponse(404, { error: "Cohort not found" });
    }

    return createResponse(200, result);
  } catch (err) {
    return createResponse(400, { error: err.message });
  }
};
