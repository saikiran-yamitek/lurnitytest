// backend/routes/admin/listCourses.js
import { listCourses } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? Number(qs.limit) : undefined;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;

    const res = await listCourses({ limit, lastKey });
    return { statusCode: 200, body: JSON.stringify(res) };
  } catch (err) {
    console.error("listCourses error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
