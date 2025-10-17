// backend/routes/admin/listUsers.js
import { listUsers } from "../../models/User.js";
import { handleOptionsRequest, createResponse, corsHeaders } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    verifyToken(event);
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? Number(qs.limit) : undefined;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : undefined;

    const res = await listUsers({ limit, lastKey });
    
    // Preserve custom Content-Type header while adding CORS headers
    return {
      statusCode: 200,
      headers: { 
        ...corsHeaders, // Add CORS headers
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(res),
    };
  } catch (err) {
    console.error("listUsers error:", err);
    const statusCode =
      err.message.includes("token") || err.message.includes("Authorization")
        ? 401
        : 500;

    return createResponse(statusCode, { error: err.message });
  }
};
