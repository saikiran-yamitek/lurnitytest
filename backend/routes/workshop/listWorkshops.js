import { listWorkshops } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // Token verification utility

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify token
    verifyToken(event);

    console.log("🔍 Fetching all workshops...");
    const workshops = await listWorkshops();
    console.log(`✅ Retrieved ${workshops?.length || 0} workshops`);

    return createResponse(200, workshops);
  } catch (err) {
    console.error("❌ Failed to list workshops:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: err.message });
  }
};
