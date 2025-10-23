import { createRequire } from 'module'; globalThis.require = createRequire(import.meta.url);

// ../backend/routes/video/getPresignedUploadUrl.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
var REGION = process.env.AWS_REGION || "ap-south-1";
var BUCKET = process.env.VIDEO_BUCKET_NAME;
if (!BUCKET) {
  throw new Error("VIDEO_BUCKET_NAME environment variable required");
}
var s3Client = new S3Client({ region: REGION });
var handler = async (event) => {
  console.log("\u{1F4E4} getPresignedUploadUrl invoked");
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: ""
    };
  }
  try {
    const auth = event.headers?.Authorization || event.headers?.authorization;
    if (!auth) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Unauthorized" })
      };
    }
    const body = JSON.parse(event.body || "{}");
    const { fileName, fileType } = body;
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "fileName and fileType required" })
      };
    }
    if (!fileType.startsWith("video/")) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Only video files allowed" })
      };
    }
    const timestamp = Date.now();
    const randomId = crypto.randomUUID();
    const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `videos/${timestamp}-${randomId}-${sanitized}`;
    console.log("\u{1F4C1} Generated file key:", fileKey);
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      ContentType: fileType
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    console.log("\u2705 Presigned upload URL generated");
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ uploadUrl, fileKey })
    };
  } catch (err) {
    console.error("\u274C getPresignedUploadUrl error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
export {
  handler
};
