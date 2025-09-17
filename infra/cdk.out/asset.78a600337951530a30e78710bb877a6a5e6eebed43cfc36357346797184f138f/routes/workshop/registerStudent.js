import { registerStudent } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { userId } = JSON.parse(event.body);

    const updated = await registerStudent(id, userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Registered successfully", updated }),
    };
  } catch (err) {
    console.error("Registration error:", err);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};
