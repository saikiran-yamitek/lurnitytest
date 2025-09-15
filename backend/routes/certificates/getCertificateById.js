// routes/certificates/getCertificateById.js
import { findCertificateById } from "../../models/Certificate.js";
import { findUserById } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const certId = event.pathParameters?.id;
    if (!certId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Certificate ID required" }) };
    }

    const cert = await findCertificateById(certId);
    if (!cert) {
      return { statusCode: 404, body: JSON.stringify({ error: "Certificate not found" }) };
    }

    const user = await findUserById(cert.userId);
    cert.userName = user?.name || "User";

    return { statusCode: 200, body: JSON.stringify(cert) };
  } catch (err) {
    console.error("Error fetching certificate by ID:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
