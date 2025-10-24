// backend/routes/user/uploadProfileImage.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET = process.env.VIDEO_BUCKET_NAME;

if (!BUCKET) {
  throw new Error("VIDEO_BUCKET_NAME environment variable required");
}

const s3Client = new S3Client({ region: REGION });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function verifyToken(event) {
  const auth = event.headers?.Authorization || event.headers?.authorization;
  if (!auth) {
    throw new Error("Missing Authorization header");
  }
  return true;
}

export const handler = async (event) => {
  console.log("📸 uploadProfileImage invoked");

  // Handle OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // Verify user token
    verifyToken(event);

    const body = JSON.parse(event.body || "{}");
    const { fileName, fileType, userId } = body;

    if (!fileName || !fileType || !userId) {
      return createResponse(400, { error: "fileName, fileType, and userId required" });
    }

    if (!fileType.startsWith("image/")) {
      return createResponse(400, { error: "Only image files allowed" });
    }

    // Generate unique file key
    const timestamp = Date.now();
    const randomId = crypto.randomUUID();
    const ext = fileName.split('.').pop();
    const fileKey = `profile-images/${userId}/${timestamp}-${randomId}.${ext}`;

    console.log("📁 Generated file key:", fileKey);

    // Generate presigned upload URL (15 minutes to upload)
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // ✅ Generate permanent public URL (never expires!)
    const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileKey}`;

    console.log("✅ Upload URL generated, public URL:", publicUrl);

    return createResponse(200, { 
      uploadUrl,   // For uploading (expires in 15 min)
      fileKey,     // For database storage
      publicUrl    // For permanent display (never expires) ✅
    });
  } catch (err) {
    console.error("❌ uploadProfileImage error:", err);

    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { error: err.message });
  }
};
