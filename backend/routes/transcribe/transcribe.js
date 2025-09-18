/******************** lambdas/transcribe/transcribe.js ********************/
import { transcribeMedia } from "../../models/Transcribe.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

/**
 * Lambda handler for POST /api/transcribe
 * @param {Object} event - API Gateway event
 * @returns {Object} - HTTP response with transcript
 */
export async function handler(event) {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { url } = body;

    if (!url) {
      return createResponse(400, { error: "url required" });
    }

    // 👉 Call the helper
    const data = await transcribeMedia(url);

    return createResponse(200, data); // { transcript: "..." }
  } catch (err) {
    console.error("Whisper-API error →", err.message);

    return createResponse(500, { error: err.message });
  }
}
