import { getSavedQuestions } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    console.log("📨 Path parameters:", event.pathParameters);
    
    // ✅ Get userId from URL path parameters instead of query string
    const userId = event.pathParameters?.id || event.pathParameters?.userId;
    
    if (!userId) {
      return createResponse(400, { msg: "userId required in path" });
    }

    console.log("🔍 Getting saved questions for userId:", userId, "(type:", typeof userId, ")");
    
    // Convert to string to match your User table key type
    const userIdString = String(userId);
    
    const questions = await getSavedQuestions(userIdString);
    
    console.log("✅ Retrieved", questions?.length || 0, "saved questions");
    
    return createResponse(200, {
      msg: "Saved questions retrieved successfully",
      savedQuestions: questions || []
    });
  } catch (err) {
    console.error("❌ Error fetching saved questions:", err);
    return createResponse(500, { 
      msg: "Error fetching saved questions", 
      error: err.message 
    });
  }
};
