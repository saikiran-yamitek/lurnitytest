import { registerStudent } from "../../models/Placement.js";

export const handler = async (event) => {
  try {
    const { driveId } = event.pathParameters;
    const { studentId } = JSON.parse(event.body);

    if (!studentId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Student ID is required" }) };
    }

    const result = await registerStudent(driveId, studentId);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
