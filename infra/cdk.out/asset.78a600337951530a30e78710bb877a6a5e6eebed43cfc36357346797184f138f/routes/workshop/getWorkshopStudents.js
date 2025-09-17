import { getWorkshopStudents } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const students = await getWorkshopStudents(id);
    return {
      statusCode: 200,
      body: JSON.stringify(students),
    };
  } catch (err) {
    console.error("Error fetching workshop students:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
