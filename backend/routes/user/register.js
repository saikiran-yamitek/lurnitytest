import { createUser, findUserByEmail } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { name, email, password, phone } = body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return createResponse(400, { msg: "User already exists" });
    }

    await createUser({ id: Date.now().toString(), name, email, password, phone });
    return createResponse(201, { msg: "User registered successfully" });
  } catch (err) {
    return createResponse(500, { msg: "Registration error", error: err.message });
  }
};
