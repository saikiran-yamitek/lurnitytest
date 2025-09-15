import { getPracticeHistory } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ msg: "userId required" }) };
    }

    const history = await getPracticeHistory(userId);
    return { statusCode: 200, body: JSON.stringify(history) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error fetching practice history", error: err.message }) };
  }
};
