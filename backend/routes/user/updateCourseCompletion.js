import { updateCourseCompletion } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  console.log('🚀 courseCompletion handler called');
  console.log('📝 Event:', JSON.stringify(event, null, 2));

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token from headers
    verifyToken(event);

    // ✅ Get userId from path parameters
    const userId = event.pathParameters?.id;
    if (!userId) {
      console.error('❌ Missing user ID in path parameters');
      return createResponse(400, { 
        msg: "Error updating course completion", 
        error: "User ID is required in path parameters" 
      });
    }

    if (!event.body) {
      return createResponse(400, { 
        msg: "Error updating course completion", 
        error: "Request body is required with courseCompletion value" 
      });
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      return createResponse(400, { 
        msg: "Error updating course completion", 
        error: "Invalid JSON in request body" 
      });
    }

    const { courseCompletion } = body;
    if (courseCompletion === undefined || courseCompletion === null) {
      return createResponse(400, { 
        msg: "Error updating course completion", 
        error: "courseCompletion is required in request body" 
      });
    }

    // Validate courseCompletion is a valid number
    if (typeof courseCompletion !== 'number' || courseCompletion < 0 || courseCompletion > 100) {
      return createResponse(400, { 
        msg: "Error updating course completion", 
        error: "courseCompletion must be a number between 0 and 100" 
      });
    }

    console.log(`🔍 Updating course completion for user ${userId} to ${courseCompletion}%`);

    // Update in DB
    const updated = await updateCourseCompletion(userId, courseCompletion);
    
    console.log('✅ Course completion updated successfully:', updated);
    return createResponse(200, { 
      msg: "Course completion updated successfully", 
      user: updated 
    });

  } catch (err) {
    console.error('❌ courseCompletion error:', err);

    // Handle token errors separately
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { 
      msg: "Error updating course completion", 
      error: err.message 
    });
  }
};
