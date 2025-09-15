import { getJobs } from "../../models/LandingPage.js";

export const handler = async () => {
  try {
    const jobs = await getJobs();
    return {
      statusCode: 200,
      body: JSON.stringify(jobs),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
