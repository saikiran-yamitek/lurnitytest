import { applyToJob } from "../../models/LandingPage.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { jobId } = event.pathParameters;
    const application = JSON.parse(event.body);

    const result = await applyToJob(jobId, application);

    return result
      ? createResponse(201, result)
      : createResponse(404, { error: "Job not found" });
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
