import jwt from "jsonwebtoken";
import { getResumeData } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    console.log("📨 Path parameters:", event.pathParameters);
    
    // ✅ Get userId from URL path parameter instead of query parameter
    const userId = event.pathParameters?.id || event.pathParameters?.userId;
    
    if (!userId) {
      return createResponse(400, { msg: "userId required in path" });
    }

    console.log("🔍 Getting resume data for userId:", userId, "(type:", typeof userId, ")");

    // Optional: Still verify token for authentication (but don't use it for userId)
    const token = event.headers?.authorization?.split(" ")[1];
    if (!token) return createResponse(401, { msg: "No token" });

    try {
      jwt.verify(token, "secretKey");
    } catch (tokenError) {
      return createResponse(401, { msg: "Invalid token" });
    }

    // Convert to string to match your database key type
    const userIdString = String(userId);
    
    const data = await getResumeData(userIdString);
    if (!data) return createResponse(404, { msg: "User not found" });

    console.log("✅ Resume data retrieved successfully for user:", userIdString);
    
    return createResponse(200, {
      msg: "Resume data retrieved successfully",
      resumeData: data
    });
  } catch (err) {
    console.error("❌ Error fetching resume data:", err);
    return createResponse(500, { 
      msg: "Error fetching user", 
      error: err.message 
    });
  }
};
