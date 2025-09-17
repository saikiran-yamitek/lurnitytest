import { deleteJob } from "../../models/LandingPage.js";

export const handler = async (event) => {
  try {
    const { jobId } = event.pathParameters;
    const result = await deleteJob(jobId);

    return result
      ? { statusCode: 200, body: JSON.stringify(result) }
      : { statusCode: 404, body: JSON.stringify({ error: "Job not found" }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
