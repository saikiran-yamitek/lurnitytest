// backend/routes/admin/updateUser.js
import { updateUser } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verification

export const handler = async (event) => {
  console.log('🚀 updateUser handler called');
  console.log('📝 Event:', JSON.stringify(event, null, 2));

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify JWT token
    verifyToken(event);

    const userId = event.pathParameters?.id;
    if (!userId) {
      console.error('❌ Missing user ID in path parameters');
      return createResponse(400, { error: "user id required" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    console.log('📝 Original request body:', body);
    
    // Remove 'id' from update data to avoid DynamoDB primary key errors
    const { id, ...updateData } = body;
    
    console.log('🔍 Update data (excluding id):', updateData);
    console.log('🔍 User ID from path:', userId);
    
    if (Object.keys(updateData).length === 0) {
      console.error('❌ No data to update');
      return createResponse(400, { error: "No data to update" });
    }

    const updated = await updateUser(userId, updateData);
    if (!updated) {
      console.error('❌ User not found or update failed');
      return createResponse(404, { error: "User not found" });
    }

    console.log('✅ User updated successfully:', updated);
    return createResponse(200, updated);

  } catch (err) {
    console.error("❌ updateUser error:", err);

    // Return 401 if token issue
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    // Better error handling for DynamoDB exceptions
    if (err.name === 'ValidationException') {
      return createResponse(400, { error: `Validation error: ${err.message}` });
    } else if (err.name === 'ConditionalCheckFailedException') {
      return createResponse(404, { error: "User not found" });
    } else if (err.name === 'ResourceNotFoundException') {
      return createResponse(404, { error: "User table not found" });
    } else {
      return createResponse(500, { error: `Internal server error: ${err.message}` });
    }
  }
};
