import { registerStudentPut } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { userId } = JSON.parse(event.body);

    const updated = await registerStudentPut(id, userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Registration successful", updated }),
    };
  } catch (err) {
    console.error("PUT Registration error:", err);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};
