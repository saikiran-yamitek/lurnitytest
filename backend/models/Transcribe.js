/******************** models/Transcribe.js ********************/
import fetch from "node-fetch";

/**
 * Call the Whisper transcription microservice with a media file URL
 * @param {string} url - Publicly accessible audio/video file URL
 * @returns {Promise<Object>} - { transcript: "..." }
 */
export async function transcribeMedia(url) {
  if (!url) {
    throw new Error("url required");
  }

  const resp = await fetch("http://whisper:9000/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!resp.ok) {
    throw new Error(await resp.text());
  }

  const data = await resp.json(); // { transcript: "..." }
  return data;
}
