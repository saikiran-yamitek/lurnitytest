import { updateCohort } from "../../models/LandingPage.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    const cohort = await updateCohort(id, body);
    if (!cohort) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Cohort not found" }),
      };
    }

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
