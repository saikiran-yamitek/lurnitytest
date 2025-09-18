import { setUserAlert } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { email, alert } = body;

    const result = await setUserAlert(email, alert);
    return createResponse(200, result);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
