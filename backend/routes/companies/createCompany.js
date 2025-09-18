// backend/routes/companies/createCompany.js
import { createCompany } from "../../models/Company.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const newCompany = await createCompany(body);

    return createResponse(201, newCompany);
  } catch (err) {
    console.error("❌ Error creating company:", err);
    return createResponse(500, { message: "Failed to create company." });
  }
};
