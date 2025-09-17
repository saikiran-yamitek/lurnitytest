import { getCohorts } from "../../models/LandingPage.js";

export const handler = async () => {
  try {
    const cohorts = await getCohorts();
    return {
      statusCode: 200,
      body: JSON.stringify(cohorts),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
