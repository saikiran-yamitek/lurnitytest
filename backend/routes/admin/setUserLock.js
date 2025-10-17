// backend/routes/admin/setUserLock.js
import { setUserLockStatus } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before proceeding
    verifyToken(event);

    // ✅ Check for userId in path
    const userId = event.pathParameters?.id;
    if (!userId) return createResponse(400, { error: "user id required" });

    // ✅ Parse lockStatus from body
    const body = event.body ? JSON.parse(event.body) : {};
    const lockStatus = body.lockStatus;
    if (lockStatus === undefined)
      return createResponse(400, { error: "lockStatus required" });

    // ✅ Update user lock status
    const updated = await setUserLockStatus(userId, lockStatus);

    return createResponse(200, updated);
  } catch (err) {
    console.error("setUserLock error:", err);

    // ✅ Return 401 if token issue, else 500
    const statusCode =
      err.message.includes("token") || err.message.includes("Authorization")
        ? 401
        : 500;

    return createResponse(statusCode, { error: err.message });
  }
};
