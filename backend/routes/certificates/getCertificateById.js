// routes/certificates/getCertificateById.js
import { findCertificateById } from "../../models/Certificate.js";
import { findUserById } from "../../models/User.js";
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

    const certId = event.pathParameters?.id;
    if (!certId) {
      return createResponse(400, { error: "Certificate ID required" });
    }

    const cert = await findCertificateById(certId);
    if (!cert) {
      return createResponse(404, { error: "Certificate not found" });
    }

    const user = await findUserById(cert.userId);
    cert.userName = user?.name || "User";

    return createResponse(200, cert);

  } catch (err) {
    console.error("Error fetching certificate by ID:", err);

    // Return 401 if token issue
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { error: "Server error" });
  }
};
