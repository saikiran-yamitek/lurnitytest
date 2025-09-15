import { deleteCourse } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "id is required" }) };
    }

    await deleteCourse(id);

    return { statusCode: 204, body: "" };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
