// backend/routes/companies/updateCompany.js
import { updateCompany } from "../../models/Company.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    const updatedCompany = await updateCompany(id, body);

    if (!updatedCompany) {
      return createResponse(404, { message: "Company not found." });
    }

    return createResponse(200, updatedCompany);
  } catch (err) {
    console.error("❌ Error updating company:", err);
    return createResponse(500, { message: "Failed to update company." });
  }
};
