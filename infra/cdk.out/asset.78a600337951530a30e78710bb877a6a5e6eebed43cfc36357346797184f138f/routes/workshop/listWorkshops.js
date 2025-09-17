import { listWorkshops } from "../../models/Workshop.js";

export const handler = async () => {
  try {
    const workshops = await listWorkshops();
    return {
      statusCode: 200,
      body: JSON.stringify(workshops),
    };
  } catch (err) {
    console.error("Failed to list workshops:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
