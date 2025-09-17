import { updateStudentAttendance } from "../../models/Workshop.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { studentId, ...updates } = body;

    const result = await updateStudentAttendance(id, studentId, updates);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    console.error("Update attendance error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
