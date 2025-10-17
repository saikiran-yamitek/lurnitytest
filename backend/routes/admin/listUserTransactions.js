// backend/routes/admin/listUserTransactions.js
import { listTransactionsByUser } from "../../models/Transaction.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    verifyToken(event);
    const userId = event.pathParameters?.id;
    if (!userId) return createResponse(400, { error: "user id required" });

    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? Number(qs.limit) : undefined;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;

    const res = await listTransactionsByUser(userId, { limit, lastKey });
    return createResponse(200, res);
  } catch (err) {
    console.error("listUserTransactions error:", err);
     const statusCode =
      err.message.includes("token") || err.message.includes("Authorization")
        ? 401
        : 500;

    return createResponse(statusCode, { error: err.message });
  }
};
