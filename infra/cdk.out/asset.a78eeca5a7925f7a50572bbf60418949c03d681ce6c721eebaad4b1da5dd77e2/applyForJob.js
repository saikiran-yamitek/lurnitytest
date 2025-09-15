import { applyForJob } from "../../models/LandingPage.js";

export const handler = async (event) => {
  try {
    const { jobId } = event.pathParameters;
    const application = JSON.parse(event.body);

    const result = await applyForJob(jobId, application);

    return result
      ? { statusCode: 201, body: JSON.stringify(result) }
      : { statusCode: 404, body: JSON.stringify({ error: "Job not found" }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
