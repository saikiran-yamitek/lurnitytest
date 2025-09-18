// backend/routes/companies/getCompanies.js
import { listCompanies } from "../../models/Company.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const companies = await listCompanies();
    return createResponse(200, companies);
  } catch (err) {
    console.error("❌ Error fetching companies:", err);
    return createResponse(500, { message: "Failed to fetch companies." });
  }
};
