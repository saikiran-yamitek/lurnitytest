import { updateWorkshop } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // Auth utility

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify authorization token
    verifyToken(event);

    const workshopId = event.pathParameters?.id;
    if (!workshopId) {
      return createResponse(400, { error: "Workshop ID is required in path parameters" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    if (!body || Object.keys(body).length === 0) {
      return createResponse(400, { error: "Request body cannot be empty" });
    }

    console.log(`🔍 Updating workshop ${workshopId} with data:`, body);
    const updated = await updateWorkshop(workshopId, body);

    return createResponse(200, { message: "Workshop updated successfully", updated });

  } catch (err) {
    console.error("❌ Workshop update error:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Failed to update workshop", details: err.message });
  }
};
