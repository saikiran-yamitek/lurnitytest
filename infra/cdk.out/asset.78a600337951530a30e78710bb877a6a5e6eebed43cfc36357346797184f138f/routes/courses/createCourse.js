import { createCourse } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const data = JSON.parse(event.body || "{}");
    const course = await createCourse(data);

    return {
      statusCode: 201,
      body: JSON.stringify(course),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
