import { updateUserProfile } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptionsRequest();

  try {
    verifyToken(event);

    const userId = event.pathParameters?.id;
    if (!userId) {
      console.error("❌ Missing userId in path parameters");
      return createResponse(400, { msg: "userId required in path parameters" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    delete body.id;
    delete body.userId;

    // ✅ Handle photo field - accept public S3 URLs
    if (body.photo) {
      // If it's a base64 string (old format), ignore it
      if (body.photo.startsWith('data:image')) {
        console.log("⚠️ Ignoring base64 photo (old format)");
        delete body.photo;
      } else if (body.photo.startsWith('https://')) {
        // It's a public S3 URL, store it
        body.photoURL = body.photo;
        delete body.photo;
      } else if (body.photo.startsWith('profile-images/')) {
        // It's an S3 key, convert to public URL
        const BUCKET = process.env.VIDEO_BUCKET_NAME;
        const REGION = process.env.AWS_REGION || "ap-south-1";
        body.photoURL = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${body.photo}`;
        delete body.photo;
      }
    }

    if (Object.keys(body).length === 0) {
      return createResponse(400, { msg: "No fields provided to update" });
    }

    console.log(`🔍 Updating profile for user ${userId}`);

    const updated = await updateUserProfile(userId, body);

    console.log(`✅ Profile updated successfully for user ${userId}`);
    return createResponse(200, { msg: "Profile updated successfully", user: updated });

  } catch (err) {
    console.error("❌ Error updating user profile:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { msg: "Internal Server Error", error: err.message });
  }
};
