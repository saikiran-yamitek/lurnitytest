import { listCourses } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const limit = event.queryStringParameters?.limit
      ? Number(event.queryStringParameters.limit)
      : undefined;
    const lastKey = event.queryStringParameters?.lastKey
      ? JSON.parse(event.queryStringParameters.lastKey)
      : undefined;

    const result = await listCourses({ limit, lastKey });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
