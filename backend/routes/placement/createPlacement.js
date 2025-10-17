import { createPlacement } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verifier

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify the token before allowing placement creation
    verifyToken(event);

    // Parse body safely
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body) {
      return createResponse(400, { error: "Request body is required" });
    }

    // Create new placement drive
    const newDrive = await createPlacement(body);
    return createResponse(201, newDrive);
  } catch (err) {
    console.error("❌ createPlacement error:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: err.message });
  }
};
