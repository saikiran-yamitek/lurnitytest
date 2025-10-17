import { updatePlacement } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before allowing access
    verifyToken(event);

    const { id } = event.pathParameters;
    const body = JSON.parse(event.body || "{}");

    const updated = await updatePlacement(id, body);

    return createResponse(200, updated);
  } catch (err) {
    console.error("❌ Error updating placement:", err);

    // ✅ Handle unauthorized cases
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: "Server error updating placement", error: err.message });
  }
};
