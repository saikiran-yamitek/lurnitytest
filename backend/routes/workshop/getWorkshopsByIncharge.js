import { getWorkshopsByIncharge } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify token for security
    verifyToken(event);

    const empId = event.pathParameters?.empId;
    if (!empId) {
      console.error("❌ Missing empId in path parameters");
      return createResponse(400, { msg: "empId is required in path parameters" });
    }

    console.log("🔍 Fetching workshops for incharge empId:", empId);

    const workshops = await getWorkshopsByIncharge(empId);

    console.log(`✅ Retrieved ${workshops?.length || 0} workshops for empId:`, empId);
    return createResponse(200, workshops);

  } catch (err) {
    console.error("❌ Error fetching workshops by incharge:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: err.message });
  }
};
