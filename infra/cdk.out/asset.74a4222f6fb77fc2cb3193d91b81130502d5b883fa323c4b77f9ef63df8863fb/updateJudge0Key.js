import { getUserFromToken, updateUserJudge0Key } from "../../models/User.js";

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

    // Parse request body
    const body = JSON.parse(event.body || "{}");
    const { key } = body;

    if (!key || !key.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: "Key required" }) };
    }

    // Update Judge0 key
    await updateUserJudge0Key(user.id, key.trim());

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("Error in updateJudge0Key Lambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};
