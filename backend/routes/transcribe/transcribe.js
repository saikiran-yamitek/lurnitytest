import { transcribeMedia } from "../../models/Transcribe.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return handleOptionsRequest();

  try {
    const body = JSON.parse(event.body || "{}");
    const { url } = body;

    if (!url) return createResponse(400, { error: "url required" });

    const data = await transcribeMedia(url);
    return createResponse(200, data);
  } catch (err) {
    console.error("Transcription error →", err.message);
    return createResponse(500, { error: err.message });
  }
}
