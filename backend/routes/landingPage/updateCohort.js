import { updateCohort } from "../../models/LandingPage.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    const cohort = await updateCohort(id, body);
    if (!cohort) {
      return createResponse(404, { error: "Cohort not found" });
    }

    return createResponse(200, cohort);
  } catch (err) {
    return createResponse(400, { error: err.message });
  }
};
