// routes/certificates/listCertificates.js
import { listCertificates } from "../../models/Certificate.js";

export const handler = async () => {
  try {
    const certs = await listCertificates();
    return {
      statusCode: 200,
      body: JSON.stringify(certs),
    };
  } catch (err) {
    console.error("Get cert error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch certificates." }),
    };
  }
};
