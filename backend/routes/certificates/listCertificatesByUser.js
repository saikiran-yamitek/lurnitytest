// routes/certificates/listCertificatesByUser.js
import { listCertificatesByUserId } from "../../models/Certificate.js";
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

    const userId = event.pathParameters?.userId;
    const id = event.pathParameters?.id;
    console.log(id);

    if (!userId) {
      return createResponse(400, { error: "User ID required" });
    }

    const certs = await listCertificatesByUserId(userId);
    return createResponse(200, certs);

  } catch (err) {
    console.error("Error fetching certificates for user:", err);

    // Return 401 if token issue
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { error: "Server error" });
  }
};
