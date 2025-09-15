// backend/routes/admin/createTransaction.js
import { createTransactionAndApply, createTransaction } from "../../models/Transaction.js";
import { getUserById } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: "user id required" }) };

    const body = event.body ? JSON.parse(event.body) : {};
    const { amount, mode, date, meta } = body;
    if (amount == null) return { statusCode: 400, body: JSON.stringify({ error: "amount required" }) };

    // Prefer transactional helper which writes transaction and updates user atomically
    if (typeof createTransactionAndApply === "function") {
      const result = await createTransactionAndApply({ userId, amount, mode, date, meta });
      return { statusCode: 201, body: JSON.stringify(result.transaction) };
    }

    // fallback: create txn then update user.amountPaid
    const txn = await createTransaction({ userId, amount, mode, date, meta });
    await getUserById(userId); // ensure user exists
    // if you have updateUserAmountPaid helper, call that instead
    // import and call updateUserAmountPaid(userId, Number(amount))

    return { statusCode: 201, body: JSON.stringify(txn) };
  } catch (err) {
    console.error("createTransaction error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Transaction logging failed", details: err.message }) };
  }
};
