// routes/certificates/checkCertificateExists.js
import { certificateExists } from "../../models/Certificate.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, subCourseTitle } = body;

    if (!userId || !subCourseTitle) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }

    const exists = await certificateExists({ userId, subCourseTitle });
    return {
      statusCode: 200,
      body: JSON.stringify({ exists }),
    };
  } catch (err) {
    console.error("Error checking certificate existence:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
