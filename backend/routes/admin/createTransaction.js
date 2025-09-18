// backend/routes/admin/createTransaction.js
import { createTransactionAndApply, createTransaction } from "../../models/Transaction.js";
import { getUserById } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const userId = event.pathParameters?.id;
    if (!userId) return createResponse(400, { error: "user id required" });

    const body = event.body ? JSON.parse(event.body) : {};
    const { amount, mode, date, meta } = body;
    if (amount == null) return createResponse(400, { error: "amount required" });

    // Prefer transactional helper which writes transaction and updates user atomically
    if (typeof createTransactionAndApply === "function") {
      const result = await createTransactionAndApply({ userId, amount, mode, date, meta });
      return createResponse(201, result.transaction);
    }

    // fallback: create txn then update user.amountPaid
    const txn = await createTransaction({ userId, amount, mode, date, meta });
    await getUserById(userId); // ensure user exists
    // if you have updateUserAmountPaid helper, call that instead
    // import and call updateUserAmountPaid(userId, Number(amount))

    return createResponse(201, txn);
  } catch (err) {
    console.error("createTransaction error:", err);
    return createResponse(500, { error: "Transaction logging failed", details: err.message });
  }
};
