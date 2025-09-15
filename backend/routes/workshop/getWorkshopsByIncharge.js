import { getWorkshopsByIncharge } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const { empId } = event.pathParameters;
    const workshops = await getWorkshopsByIncharge(empId);
    return {
      statusCode: 200,
      body: JSON.stringify(workshops),
    };
  } catch (err) {
    console.error("Error fetching workshops by incharge:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
