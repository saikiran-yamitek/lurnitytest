// routes/certificates/listCertificatesByUser.js
import { listCertificatesByUserId } from "../../models/Certificate.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return createResponse(400, { error: "User ID required" });
    }

    const certs = await listCertificatesByUserId(userId);
    return createResponse(200, certs);
  } catch (err) {
    console.error("Error fetching certificates for user:", err);
    return createResponse(500, { error: "Server error" });
  }
};
