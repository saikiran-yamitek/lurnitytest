import { deletePlacement } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verifier

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify the token before allowing deletion
    verifyToken(event);

    const { id } = event.pathParameters || {};
    if (!id) {
      return createResponse(400, { error: "Placement ID is required" });
    }

    const result = await deletePlacement(id);
    return createResponse(200, result);
  } catch (err) {
    console.error("❌ deletePlacement error:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: err.message });
  }
};
