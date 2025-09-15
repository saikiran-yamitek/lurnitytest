// routes/certificates/listCertificatesByUser.js
import { listCertificatesByUserId } from "../../models/Certificate.js";

export const handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "User ID required" }) };
    }

    const certs = await listCertificatesByUserId(userId);
    return {
      statusCode: 200,
      body: JSON.stringify(certs),
    };
  } catch (err) {
    console.error("Error fetching certificates for user:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
