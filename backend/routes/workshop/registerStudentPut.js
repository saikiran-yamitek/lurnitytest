import { registerStudentPut } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // your auth utility

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify token
    verifyToken(event);

    const workshopId = event.pathParameters?.id;
    if (!workshopId) {
      return createResponse(400, { error: "Workshop ID is required in path parameters" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const userId = body.userId;
    if (!userId) {
      return createResponse(400, { error: "userId is required in request body" });
    }

    console.log(`🔍 Updating registration for user ${userId} in workshop ${workshopId}`);
    const updated = await registerStudentPut(workshopId, userId);

    return createResponse(200, { message: "Registration successful", updated });

  } catch (err) {
    console.error("❌ PUT Registration error:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Failed to register student", details: err.message });
  }
};
