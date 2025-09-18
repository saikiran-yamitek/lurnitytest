import { getJobs } from "../../models/LandingPage.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const jobs = await getJobs();
    return createResponse(200, jobs);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
