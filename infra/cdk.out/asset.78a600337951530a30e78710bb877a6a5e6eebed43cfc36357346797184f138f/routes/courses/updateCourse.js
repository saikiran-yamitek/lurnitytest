import { updateCourse } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "id is required" }) };
    }

    const data = JSON.parse(event.body || "{}");
    const updated = await updateCourse(id, data);

    if (!updated) {
      return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(updated),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
