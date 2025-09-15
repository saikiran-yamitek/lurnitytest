// backend/routes/companies/createCompany.js
import { createCompany } from "../../models/Company.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const newCompany = await createCompany(body);

    return {
      statusCode: 201,
      body: JSON.stringify(newCompany),
    };
  } catch (err) {
    console.error("❌ Error creating company:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create company." }),
    };
  }
};
