import { getUserById } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  console.log('🚀 getUserProfile handler called');

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify the request token
    verifyToken(event);

    // Get userId from path parameters
    const userId = event.pathParameters?.id;
    
    if (!userId) {
      return createResponse(400, { 
        msg: "Error fetching user profile", 
        error: "User ID is required in path parameters" 
      });
    }

    const user = await getUserById(userId);
    
    if (!user) {
      return createResponse(404, { 
        msg: "User not found", 
        error: `No user found with ID: ${userId}` 
      });
    }

    // Remove sensitive fields before sending response
    const { password, ...userProfile } = user;
    
    return createResponse(200, {
      msg: "User profile fetched successfully",
      user: userProfile
    });

  } catch (err) {
    console.error('❌ getUserProfile error:', err);

    // Handle token errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { 
      msg: "Error fetching user profile", 
      error: err.message 
    });
  }
};
