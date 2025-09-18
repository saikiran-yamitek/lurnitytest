import { getUserById } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  console.log('🚀 getUserProfile handler called');
  console.log('📝 Event:', JSON.stringify(event, null, 2));

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ FIXED: Get userId from path parameters (not query parameters)
    const userId = event.pathParameters?.id;
    
    if (!userId) {
      console.error('❌ Missing user ID in path parameters');
      return createResponse(400, { 
        msg: "Error fetching user profile", 
        error: "User ID is required in path parameters" 
      });
    }

    console.log(`🔍 Fetching profile for user: ${userId}`);

    const user = await getUserById(userId);
    
    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      return createResponse(404, { 
        msg: "User not found", 
        error: `No user found with ID: ${userId}` 
      });
    }

    console.log('✅ User profile fetched successfully');
    
    // Remove sensitive fields before sending response
    const { password, ...userProfile } = user;
    
    return createResponse(200, {
      msg: "User profile fetched successfully",
      user: userProfile
    });

  } catch (err) {
    console.error('❌ getUserProfile error:', err);
    return createResponse(500, { 
      msg: "Error fetching user profile", 
      error: err.message 
    });
  }
};
