import { createPlacement } from "../../models/Placement.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const newDrive = await createPlacement(body);
    return {
      statusCode: 201,
      body: JSON.stringify(newDrive),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
