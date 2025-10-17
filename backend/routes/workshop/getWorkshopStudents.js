import { getWorkshopStudents } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify token for security
    verifyToken(event);

    const workshopId = event.pathParameters?.id;
    if (!workshopId) {
      console.error("❌ Missing workshop ID in path parameters");
      return createResponse(400, { msg: "Workshop ID is required in path parameters" });
    }

    console.log("🔍 Fetching students for workshop ID:", workshopId);

    const students = await getWorkshopStudents(workshopId);

    console.log(`✅ Retrieved ${students?.length || 0} students for workshop ID:`, workshopId);
    return createResponse(200, students);

  } catch (err) {
    console.error("❌ Error fetching workshop students:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: err.message });
  }
};
