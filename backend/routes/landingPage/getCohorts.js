import { getCohorts } from "../../models/LandingPage.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const cohorts = await getCohorts();
    return createResponse(200, cohorts);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
