import { saveQuestion } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, question, correctAnswer } = body;

    await saveQuestion(userId, question, correctAnswer);
    return { statusCode: 200, body: JSON.stringify({ msg: "Question saved" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error saving question", error: err.message }) };
  }
};
