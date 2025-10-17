// routes/certificates/checkCertificateExists.js
import { certificateExists } from "../../models/Certificate.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify JWT token before processing
    verifyToken(event);

    const body = JSON.parse(event.body || "{}");
    const { userId, subCourseTitle } = body;

    if (!userId || !subCourseTitle) {
      return createResponse(400, { error: "Missing fields" });
    }

    const exists = await certificateExists({ userId, subCourseTitle });
    return createResponse(200, { exists });
  } catch (err) {
    console.error("Error checking certificate existence:", err);

    // Return 401 if token issue
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { error: "Server error" });
  }
};
