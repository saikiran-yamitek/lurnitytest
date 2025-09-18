import { getLatestLandingPage } from "../../models/LandingPage.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const page = await getLatestLandingPage();
    return createResponse(200, page || {});
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
