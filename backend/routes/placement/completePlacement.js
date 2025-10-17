import { markDriveCompleted } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Token verification import

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before performing any action
    verifyToken(event);

    const { id } = event.pathParameters || {};
    if (!id) {
      return createResponse(400, { error: "Drive ID required" });
    }

    const updated = await markDriveCompleted(id);

    if (!updated) {
      return createResponse(404, { error: "Drive not found or already completed" });
    }

    return createResponse(200, updated);
  } catch (err) {
    console.error("❌ markDriveCompleted error:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: err.message });
  }
};
