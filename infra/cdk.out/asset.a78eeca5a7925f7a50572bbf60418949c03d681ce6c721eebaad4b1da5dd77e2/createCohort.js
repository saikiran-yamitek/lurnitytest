import { createCohort } from "../../models/LandingPage.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const cohort = await createCohort(body);

    return {
      statusCode: 200,
      body: JSON.stringify(cohort),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
