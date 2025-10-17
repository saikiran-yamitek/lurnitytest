// backend/routes/companies/createCompany.js
import { createCompany } from "../../models/Company.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ import token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify JWT token before processing
    verifyToken(event);

    const body = JSON.parse(event.body);
    const newCompany = await createCompany(body);

    return createResponse(201, newCompany);
  } catch (err) {
    console.error("❌ Error creating company:", err);

    // Return 401 if token issue
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { message: "Failed to create company." });
  }
};
