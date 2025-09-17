import { deleteWorkshop } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const result = await deleteWorkshop(id);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    console.error("Delete workshop error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
