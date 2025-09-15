import { listPlacements } from "../../models/Placement.js";

export const handler = async () => {
  try {
    const drives = await listPlacements();
    return {
      statusCode: 200,
      body: JSON.stringify(drives),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
