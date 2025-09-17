import { getSavedQuestions } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ msg: "userId required" }) };
    }

    const questions = await getSavedQuestions(userId);
    return { statusCode: 200, body: JSON.stringify(questions) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error fetching saved questions", error: err.message }) };
  }
};
