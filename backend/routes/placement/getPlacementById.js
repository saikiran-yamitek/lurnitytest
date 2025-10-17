import { getPlacementById } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verifier

export async function handler(event) {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify the token before proceeding
    verifyToken(event);

    const driveId = event.pathParameters?.driveId;

    if (!driveId) {
      return createResponse(400, { message: "Missing driveId in path parameters" });
    }

    const placement = await getPlacementById(driveId);

    if (!placement) {
      return createResponse(404, { message: "Placement not found" });
    }

    return createResponse(200, placement);
  } catch (error) {
    console.error("❌ Error fetching placement by ID:", error);

    // Handle unauthorized errors separately
    if (error.message.includes("token") || error.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, {
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
