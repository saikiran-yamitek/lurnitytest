import { deleteCohort } from "../../models/LandingPage.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;

    const result = await deleteCohort(id);
    if (!result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Cohort not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
