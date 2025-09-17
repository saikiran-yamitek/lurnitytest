// backend/routes/admin/listUserTransactions.js
import { listTransactionsByUser } from "../../models/Transaction.js";

export const handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: "user id required" }) };

    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? Number(qs.limit) : undefined;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;

    const res = await listTransactionsByUser(userId, { limit, lastKey });
    return { statusCode: 200, body: JSON.stringify(res) };
  } catch (err) {
    console.error("listUserTransactions error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
