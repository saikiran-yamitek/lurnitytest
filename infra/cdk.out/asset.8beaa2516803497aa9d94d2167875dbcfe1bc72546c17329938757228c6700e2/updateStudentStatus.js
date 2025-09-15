import { updateStudentStatus } from "../../models/Placement.js";

export const handler = async (event) => {
  try {
    const { driveId, studentId } = event.pathParameters;
    const body = JSON.parse(event.body);

    const result = await updateStudentStatus(driveId, studentId, body);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
