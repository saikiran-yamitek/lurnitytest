import { updateJob } from "../../models/LandingPage.js";

export const handler = async (event) => {
  try {
    const { jobId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const updated = await updateJob(jobId, body);

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
