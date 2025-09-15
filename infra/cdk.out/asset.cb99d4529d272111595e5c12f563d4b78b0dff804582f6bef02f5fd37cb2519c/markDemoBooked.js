import { markDemoBooked } from "../../models/Demo.js";

export const handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "id is required" }),
      };
    }

    const updated = await markDemoBooked(id);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Demo marked as booked", demo: updated }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
