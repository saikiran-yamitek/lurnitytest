import { createJob } from "../../models/LandingPage.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const newJob = await createJob(body);
    return {
      statusCode: 201,
      body: JSON.stringify(newJob),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
