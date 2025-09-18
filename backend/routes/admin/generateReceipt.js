// backend/routes/admin/generateReceipt.js
import { getUserById } from "../../models/User.js";
import { generateAndUploadReceipt } from "../../utils/pdfReceipt.js";
import { handleOptionsRequest, createResponse, corsHeaders } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const userId = event.pathParameters?.id;
    if (!userId) return createResponse(400, { error: "user id required" });

    const user = await getUserById(userId);
    if (!user) return createResponse(404, { message: "User not found" });

    // Prefer generating and uploading to S3, returning presigned URL
    if (typeof generateAndUploadReceipt === "function") {
      const url = await generateAndUploadReceipt(userId);
      return createResponse(200, { url });
    }

    // fallback: return PDF as base64 - preserve custom headers and isBase64Encoded
    const buffer = await generateReceiptBuffer(user); // must return Buffer
    const b64 = buffer.toString("base64");
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        ...corsHeaders, // Add CORS headers
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt_${userId}.pdf"`,
      },
      body: b64,
    };
  } catch (err) {
    console.error("generateReceipt error:", err);
    return createResponse(500, { message: "Failed to generate receipt", details: err.message });
  }
};
