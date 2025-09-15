import { getStreakData } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ msg: "userId required" }) };
    }

    const streakData = await getStreakData(userId);
    return { statusCode: 200, body: JSON.stringify(streakData) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error fetching streak data", error: err.message }) };
  }
};
