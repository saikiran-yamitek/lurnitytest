import { createUser, findUserByEmail } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name, email, password, phone } = body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return { statusCode: 400, body: JSON.stringify({ msg: "User already exists" }) };
    }

    await createUser({ id: Date.now().toString(), name, email, password, phone });
    return { statusCode: 201, body: JSON.stringify({ msg: "User registered successfully" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Registration error", error: err.message }) };
  }
};
