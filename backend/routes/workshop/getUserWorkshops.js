import { getUserWorkshops } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify token
    verifyToken(event);

    const userId = event.pathParameters?.userId;
    if (!userId) {
      console.error("❌ Missing userId in path parameters");
      return createResponse(400, { msg: "userId is required in path parameters" });
    }

    console.log("🔍 Fetching workshops for userId:", userId);

    const workshops = await getUserWorkshops(userId);

    console.log(`✅ Retrieved ${workshops?.length || 0} workshops for userId:`, userId);
    return createResponse(200, workshops);

  } catch (err) {
    console.error("❌ Error fetching user workshops:", err);

    // Handle token errors explicitly
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: err.message });
  }
};
