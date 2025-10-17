import { getSavedQuestions } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token from headers
    verifyToken(event);

    console.log("📨 Path parameters:", event.pathParameters);
    
    // Get userId from URL path parameters
    const userId = event.pathParameters?.id || event.pathParameters?.userId;
    
    if (!userId) {
      return createResponse(400, { msg: "userId required in path" });
    }

    console.log("🔍 Getting saved questions for userId:", userId);
    
    const userIdString = String(userId); // ensure string type
    const questions = await getSavedQuestions(userIdString);
    
    console.log("✅ Retrieved", questions?.length || 0, "saved questions");
    
    return createResponse(200, {
      msg: "Saved questions retrieved successfully",
      savedQuestions: questions || []
    });
  } catch (err) {
    console.error("❌ Error fetching saved questions:", err);

    // Token/authorization errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { 
      msg: "Error fetching saved questions", 
      error: err.message 
    });
  }
};
