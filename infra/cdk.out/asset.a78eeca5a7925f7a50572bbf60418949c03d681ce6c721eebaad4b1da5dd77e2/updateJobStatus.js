import { updateJobStatus } from "../../models/LandingPage.js";

export const handler = async (event) => {
  try {
    const { jobId } = event.pathParameters;
    const { isActive } = JSON.parse(event.body);

    const updated = await updateJobStatus(jobId, isActive);

    return updated
      ? { statusCode: 200, body: JSON.stringify(updated) }
      : { statusCode: 404, body: JSON.stringify({ error: "Job not found" }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
