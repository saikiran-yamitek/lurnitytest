import { addPracticeResult } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, result } = body;

    const updated = await addPracticeResult(userId, result);
    return { statusCode: 200, body: JSON.stringify({ practiceHistory: updated }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error adding practice result", error: err.message }) };
  }
};
