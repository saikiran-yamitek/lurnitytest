// backend/routes/admin/listUsers.js
import { listUsers } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? Number(qs.limit) : undefined;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;

    const res = await listUsers({ limit, lastKey });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res),
    };
  } catch (err) {
    console.error("listUsers error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
