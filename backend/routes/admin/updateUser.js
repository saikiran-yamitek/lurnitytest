
// backend/routes/admin/updateUser.js
import { updateUser, getUserById } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: "user id required" }) };

    const body = event.body ? JSON.parse(event.body) : {};
    const updated = await updateUser(userId, body);
    if (!updated) return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };

    return { statusCode: 200, body: JSON.stringify(updated) };
  } catch (err) {
    console.error("updateUser error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
