// backend/routes/admin/setUserLock.js
import { setUserLockStatus } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: "user id required" }) };

    const body = event.body ? JSON.parse(event.body) : {};
    const lockStatus = body.lockStatus;
    if (lockStatus === undefined) return { statusCode: 400, body: JSON.stringify({ error: "lockStatus required" }) };

    const updated = await setUserLockStatus(userId, lockStatus);
    return { statusCode: 200, body: JSON.stringify(updated) };
  } catch (err) {
    console.error("setUserLock error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
