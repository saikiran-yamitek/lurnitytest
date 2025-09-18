import { getUserFromToken, updateUserJudge0Key } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const authHeader = event.headers?.authorization || "";
    if (!authHeader) {
      return createResponse(401, { error: "Unauthorized" });
    }

    // Extract user from token
    const user = await getUserFromToken(authHeader);
    if (!user) {
      return createResponse(401, { error: "Unauthorized" });
    }

    // Parse request body
    const body = JSON.parse(event.body || "{}");
    const { key } = body;

    if (!key || !key.trim()) {
      return createResponse(400, { error: "Key required" });
    }

    // Update Judge0 key
    await updateUserJudge0Key(user.id, key.trim());

    return createResponse(200, { ok: true });
  } catch (err) {
    console.error("Error in updateJudge0Key Lambda:", err);
    return createResponse(500, { error: "Internal Server Error" });
  }
};
