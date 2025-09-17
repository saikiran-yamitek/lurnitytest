/******************** lambdas/transcribe/transcribe.js ********************/
import { transcribeMedia } from "../../models/Transcribe.js";

/**
 * Lambda handler for POST /api/transcribe
 * @param {Object} event - API Gateway event
 * @returns {Object} - HTTP response with transcript
 */
export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const { url } = body;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "url required" }),
      };
    }

    // 👉 Call the helper
    const data = await transcribeMedia(url);

    return {
      statusCode: 200,
      body: JSON.stringify(data), // { transcript: "..." }
    };
  } catch (err) {
    console.error("Whisper-API error →", err.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
