import { updateStreakData } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, streakData } = body;

    const updated = await updateStreakData(userId, streakData);
    return { statusCode: 200, body: JSON.stringify({ streakData: updated }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error updating streak data", error: err.message }) };
  }
};
