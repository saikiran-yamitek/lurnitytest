import { deleteWorkshop } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify token
    verifyToken(event);

    const workshopId = event.pathParameters?.id;
    if (!workshopId) {
      console.error("❌ Missing workshop ID in path parameters");
      return createResponse(400, { msg: "workshop ID is required in path parameters" });
    }

    console.log("🗑 Deleting workshop with ID:", workshopId);

    const result = await deleteWorkshop(workshopId);

    console.log("✅ Workshop deleted successfully:", workshopId);
    return createResponse(200, { msg: "Workshop deleted", result });

  } catch (err) {
    console.error("❌ Delete workshop error:", err);

    // Handle token errors explicitly
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: err.message });
  }
};
