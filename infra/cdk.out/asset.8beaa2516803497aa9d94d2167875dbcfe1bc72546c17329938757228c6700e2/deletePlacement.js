import { deletePlacement } from "../../models/Placement.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const result = await deletePlacement(id);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
