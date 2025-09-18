// backend/routes/admin/deleteUser.js
import { deleteUser } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const userId = event.pathParameters?.id;
    if (!userId) return createResponse(400, { error: "user id required" });

    await deleteUser(userId);
    return createResponse(200, { success: true });
  } catch (err) {
    console.error("deleteUser error:", err);
    return createResponse(500, { error: err.message });
  }
};
