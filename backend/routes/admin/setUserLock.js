// backend/routes/admin/setUserLock.js
import { setUserLockStatus } from "../../models/User.js";
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
    const lockStatus = body.lockStatus;
    if (lockStatus === undefined) return createResponse(400, { error: "lockStatus required" });

    const updated = await setUserLockStatus(userId, lockStatus);
    return createResponse(200, updated);
  } catch (err) {
    console.error("setUserLock error:", err);
    return createResponse(500, { error: err.message });
  }
};
