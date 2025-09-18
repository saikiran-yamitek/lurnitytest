// backend/routes/admin/exportUsersCsv.js
import { listUsers } from "../../models/User.js";
import { convertToCSV } from "../../utils/csvExport.js";
import { handleOptionsRequest, createResponse, corsHeaders } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // get full list (careful with very large tables — prefer pagination or S3 streaming)
    const { items } = await listUsers({}); // you can change to paginated approach
    
    // Prefer uploading to S3 and returning presigned URL if helper exists
    if (typeof exportUsersToS3 === "function") {
      const url = await exportUsersToS3(items);
      return createResponse(200, { url });
    }

    // fallback: return CSV directly (base64) - preserve custom headers and isBase64Encoded
    const csv = convertToCSV(items);
    const buff = Buffer.from(csv, "utf8").toString("base64");
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        ...corsHeaders, // Add CORS headers
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=users.csv",
      },
      body: buff,
    };
  } catch (err) {
    console.error("exportUsersCsv error:", err);
    return createResponse(500, { error: err.message });
  }
};
