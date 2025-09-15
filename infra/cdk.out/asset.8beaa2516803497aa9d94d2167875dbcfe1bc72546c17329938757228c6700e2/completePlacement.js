import { markDriveCompleted } from "../../models/Placement.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const updated = await markDriveCompleted(id);
    return { statusCode: 200, body: JSON.stringify(updated) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
