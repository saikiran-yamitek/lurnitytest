// frontend/src/components/admin/s3Upload.js

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Upload video to S3 and return the file key
 */
export const uploadVideoToS3 = async (file, role = "admin") => {
  try {
    const token = role === "admin" 
      ? localStorage.getItem("adminToken") 
      : localStorage.getItem("empToken");

    // Step 1: Get presigned upload URL from backend
    const presignResponse = await fetch(`${API_URL}/api/admin/videos/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    if (!presignResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, fileKey } = await presignResponse.json();

    // Step 2: Upload file directly to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('S3 upload failed');
    }

    // Step 3: Return S3 file key (NOT the URL)
    return fileKey;
  } catch (err) {
    console.error('❌ S3 upload error:', err);
    throw err;
  }
};

/**
 * Get temporary playback URL for a video file key
 */
export const getVideoPlaybackUrl = async (fileKey, role = "admin") => {
  try {
    const token = role === "admin" 
      ? localStorage.getItem("adminToken") 
      : role === "user"
        ? localStorage.getItem("token")
        : localStorage.getItem("empToken");

    const response = await fetch(
      `${API_URL}/api/videos/playback-url?fileKey=${encodeURIComponent(fileKey)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get playback URL');
    }

    const { url } = await response.json();
    return url;
  } catch (err) {
    console.error('❌ Failed to get playback URL:', err);
    throw err;
  }
};
