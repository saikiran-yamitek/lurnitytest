import { registerStudentPut } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const { userId } = JSON.parse(event.body);

    const updated = await registerStudentPut(id, userId);
    return createResponse(200, { message: "Registration successful", updated });
  } catch (err) {
    console.error("PUT Registration error:", err);
    return createResponse(400, { error: err.message });
  }
};
