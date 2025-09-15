import { updateWorkshop } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    const updated = await updateWorkshop(id, body);
    return {
      statusCode: 200,
      body: JSON.stringify(updated),
    };
  } catch (err) {
    console.error("Workshop update error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
