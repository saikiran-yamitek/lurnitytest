import { getUserById } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ msg: "userId required" }) };
    }

    const user = await getUserById(userId);
    if (!user) return { statusCode: 404, body: JSON.stringify({ msg: "User not found" }) };

    return { statusCode: 200, body: JSON.stringify(user) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error fetching user", error: err.message }) };
  }
};
