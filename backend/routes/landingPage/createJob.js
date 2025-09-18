import { createJob } from "../../models/LandingPage.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const newJob = await createJob(body);

    return createResponse(201, newJob);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
