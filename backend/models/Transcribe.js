import AWS from "aws-sdk";
import fetch from "node-fetch";

const transcribe = new AWS.TranscribeService({ region: "ap-south-1" });

/**
 * Transcribe a media file from a URL using AWS Transcribe
 * @param {string} url - public audio/video file URL
 * @returns {Promise<{transcript: string}>}
 */
export async function transcribeMedia(url) {
  if (!url) throw new Error("url required");

  const jobName = `transcribe-${Date.now()}`;

  // Start transcription job
  await transcribe.startTranscriptionJob({
    TranscriptionJobName: jobName,
    Media: { MediaFileUri: url },
    MediaFormat: "mp4", // change to "mp3" if audio only
    LanguageCode: "en-US",
  }).promise();

  // Wait for transcription to complete
  let status;
  let transcript = "";
  do {
    await new Promise(r => setTimeout(r, 5000));
    const res = await transcribe.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
    status = res.TranscriptionJob.TranscriptionJobStatus;

    if (status === "COMPLETED") {
      const resp = await fetch(res.TranscriptionJob.Transcript.TranscriptFileUri);
      const data = await resp.json();
      transcript = data.results.transcripts[0].transcript;
    } else if (status === "FAILED") {
      throw new Error("Transcription failed");
    }
  } while (status === "IN_PROGRESS");

  return { transcript };
}
