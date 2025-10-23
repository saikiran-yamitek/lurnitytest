// backend/routes/video/getPresignedPlaybackUrl.js
import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET = process.env.VIDEO_BUCKET_NAME;

if (!BUCKET) {
  throw new Error("VIDEO_BUCKET_NAME environment variable required");
}

const s3Client = new S3Client({ region: REGION });

export const handler = async (event) => {
  console.log("📥 getPresignedPlaybackUrl invoked");

  // Handle OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: "",
    };
  }

  try {
    // Basic auth check
    const auth = event.headers?.Authorization || event.headers?.authorization;
    if (!auth) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const fileKey = event.queryStringParameters?.fileKey;

    if (!fileKey) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "fileKey query parameter required" }),
      };
    }

    console.log("🎥 Requesting playback URL for:", fileKey);

    // Check if file exists in S3
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: BUCKET,
          Key: fileKey,
        })
      );
    } catch (err) {
      console.error("❌ File not found:", fileKey);
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Video file not found" }),
      };
    }

    // Generate presigned playback URL (1 hour expiry)
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    console.log("✅ Presigned playback URL generated");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ url }),
    };
  } catch (err) {
    console.error("❌ getPresignedPlaybackUrl error:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
