// backend/routes/admin/deleteUser.js
import { deleteUser } from "../../models/User.js";
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

    await deleteUser(userId);
    return createResponse(200, { success: true });
  } catch (err) {
    console.error("deleteUser error:", err);
    const statusCode =
      err.message.includes("token") || err.message.includes("Authorization")
        ? 401
        : 500;

    return createResponse(statusCode, { error: err.message });
  }
};
