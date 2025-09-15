import { getUserWorkshops } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const { userId } = event.pathParameters;
    const workshops = await getUserWorkshops(userId);
    return {
      statusCode: 200,
      body: JSON.stringify(workshops),
    };
  } catch (err) {
    console.error("Error fetching user workshops:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
