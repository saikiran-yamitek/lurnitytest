// backend/routes/companies/getCompanies.js
import { listCompanies } from "../../models/Company.js";

export const handler = async () => {
  try {
    const companies = await listCompanies();
    return {
      statusCode: 200,
      body: JSON.stringify(companies),
    };
  } catch (err) {
    console.error("❌ Error fetching companies:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch companies." }),
    };
  }
};
