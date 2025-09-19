import AWS from "aws-sdk";
import fetch from "node-fetch";

// Configure AWS SDK (ensure Lambda has proper IAM permissions)
const transcribe = new AWS.TranscribeService({ region: "ap-south-1" });

/**
 * Transcribe a media file using AWS Transcribe
 * @param {string} url - Publicly accessible video/audio file URL
 * @returns {Promise<Object>} - { transcript: "..." }
 */
export async function transcribeMedia(url) {
  if (!url) throw new Error("url required");

  const jobName = `job-${Date.now()}`;

  // Start transcription job
  await transcribe.startTranscriptionJob({
    TranscriptionJobName: jobName,
    Media: { MediaFileUri: url },
    MediaFormat: "mp4", // change to 'mp3' if audio
    LanguageCode: "en-US"
  }).promise();

  // Poll until job completes
  let status = "IN_PROGRESS";
  while (status === "IN_PROGRESS") {
    await new Promise(r => setTimeout(r, 5000)); // wait 5s
    const data = await transcribe.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
    status = data.TranscriptionJob.TranscriptionJobStatus;

    if (status === "FAILED") {
      throw new Error(data.TranscriptionJob.FailureReason);
    }

    if (status === "COMPLETED") {
      const transcriptUrl = data.TranscriptionJob.Transcript.TranscriptFileUri;
      const res = await fetch(transcriptUrl);
      const json = await res.json();
      return { transcript: json.results.transcripts[0].transcript };
    }
  }
}
