// routes/certificates/listCertificates.js
import { listCertificates } from "../../models/Certificate.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const certs = await listCertificates();
    return createResponse(200, certs);
  } catch (err) {
    console.error("Get cert error:", err);
    return createResponse(500, { message: "Failed to fetch certificates." });
  }
};
