import { updateJob } from "../../models/LandingPage.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { jobId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const updated = await updateJob(jobId, body);

    return updated
      ? createResponse(200, updated)
      : createResponse(404, { error: "Job not found" });
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
