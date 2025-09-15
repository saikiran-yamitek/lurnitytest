// backend/routes/admin/generateReceipt.js
import { getUserById } from "../../models/User.js";
import { generateAndUploadReceipt, generateReceiptBuffer } from "../../utils/pdfReceipt.js";

export const handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: "user id required" }) };

    const user = await getUserById(userId);
    if (!user) return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) };

    // Prefer generating and uploading to S3, returning presigned URL
    if (typeof generateAndUploadReceipt === "function") {
      const url = await generateAndUploadReceipt(userId);
      return { statusCode: 200, body: JSON.stringify({ url }) };
    }

    // fallback: return PDF as base64
    const buffer = await generateReceiptBuffer(user); // must return Buffer
    const b64 = buffer.toString("base64");
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt_${userId}.pdf"`,
      },
      body: b64,
    };
  } catch (err) {
    console.error("generateReceipt error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to generate receipt", details: err.message }) };
  }
};
