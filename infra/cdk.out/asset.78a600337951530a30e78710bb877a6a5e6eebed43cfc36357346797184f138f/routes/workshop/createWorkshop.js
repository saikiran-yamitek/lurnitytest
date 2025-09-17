import { createWorkshop } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const newWorkshop = await createWorkshop(body);
    return {
      statusCode: 201,
      body: JSON.stringify(newWorkshop),
    };
  } catch (err) {
    console.error("Workshop creation error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
