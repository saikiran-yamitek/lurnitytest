import { listDemos } from "../../models/Demo.js";

export const handler = async () => {
  try {
    const demos = await listDemos();

    return {
      statusCode: 200,
      body: JSON.stringify(demos),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
