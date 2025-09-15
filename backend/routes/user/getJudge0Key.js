import { getUserFromToken, getUserJudge0Key } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.authorization || "";
    if (!authHeader) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    // Extract user from token
    const user = await getUserFromToken(authHeader);
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    // Fetch judge0Key
    const key = await getUserJudge0Key(user.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ key: key || "" }),
    };
  } catch (err) {
    console.error("Error in getJudge0Key Lambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};
