import { updateUserProfile } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") return handleOptionsRequest();

  try {
    // ✅ Verify token
    verifyToken(event);

    const userId = event.pathParameters?.id;
    if (!userId) {
      console.error("❌ Missing userId in path parameters");
      return createResponse(400, { msg: "userId required in path parameters" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    // 🚫 Prevent overwriting key
    delete body.id;
    delete body.userId;

    if (Object.keys(body).length === 0) {
      return createResponse(400, { msg: "No fields provided to update" });
    }

    console.log(`🔍 Updating profile for user ${userId} with fields:`, body);

    const updated = await updateUserProfile(userId, body);

    console.log(`✅ Profile updated successfully for user ${userId}`);
    return createResponse(200, { msg: "Profile updated successfully", user: updated });

  } catch (err) {
    console.error("❌ Error updating user profile:", err);

    // Handle token errors explicitly
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { msg: "Internal Server Error", error: err.message });
  }
};
