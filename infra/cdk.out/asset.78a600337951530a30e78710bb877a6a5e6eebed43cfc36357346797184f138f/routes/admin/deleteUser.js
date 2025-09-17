// backend/routes/admin/deleteUser.js
import { deleteUser } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: "user id required" }) };

    await deleteUser(userId);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("deleteUser error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
