import { listPlacements } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ import token verifier

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Check if token is valid
    verifyToken(event);

    const drives = await listPlacements();
    return createResponse(200, drives);
  } catch (err) {
    console.error("❌ Error listing placements:", err);

    // ✅ Return proper response for token issues
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: "Server error listing placements", error: err.message });
  }
};
