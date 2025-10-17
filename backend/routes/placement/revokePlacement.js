import { revokeDrive } from "../../models/Placement.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before proceeding
    verifyToken(event);

    const { id } = event.pathParameters;
    const updated = await revokeDrive(id);

    return createResponse(200, updated);
  } catch (err) {
    console.error("❌ Error revoking drive:", err);

    // ✅ Handle unauthorized token cases
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: "Server error revoking drive", error: err.message });
  }
};
