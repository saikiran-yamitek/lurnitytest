import { registerStudent } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const { userId } = JSON.parse(event.body);

    const updated = await registerStudent(id, userId);
    return createResponse(200, { message: "Registered successfully", updated });
  } catch (err) {
    console.error("Registration error:", err);
    return createResponse(400, { error: err.message });
  }
};
