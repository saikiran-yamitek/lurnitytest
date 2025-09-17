// backend/routes/companies/updateCompany.js
import { updateCompany } from "../../models/Company.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    const updatedCompany = await updateCompany(id, body);

    if (!updatedCompany) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Company not found." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(updatedCompany),
    };
  } catch (err) {
    console.error("❌ Error updating company:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to update company." }),
    };
  }
};
