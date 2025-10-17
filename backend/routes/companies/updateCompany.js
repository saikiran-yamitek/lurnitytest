// backend/routes/companies/updateCompany.js
import { updateCompany } from "../../models/Company.js";
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

    const { id } = event.pathParameters;
    if (!id) return createResponse(400, { error: "Company ID required" });

    const body = event.body ? JSON.parse(event.body) : {};
    const updatedCompany = await updateCompany(id, body);

    if (!updatedCompany) {
      return createResponse(404, { message: "Company not found." });
    }

    return createResponse(200, updatedCompany);
  } catch (err) {
    console.error("❌ Error updating company:", err);

    // Return 401 if token is missing or invalid
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { message: "Failed to update company." });
  }
};
