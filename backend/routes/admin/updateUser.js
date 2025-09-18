// backend/routes/admin/updateUser.js
import { updateUser, getUserById } from "../../models/User.js";
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
    const updated = await updateUser(userId, body);
    if (!updated) return createResponse(404, { error: "Not found" });

    return createResponse(200, updated);
  } catch (err) {
    console.error("updateUser error:", err);
    return createResponse(500, { error: err.message });
  }
};
