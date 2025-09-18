import { getUserFromToken, getUserJudge0Key } from "../../models/User.js";
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

    // Fetch judge0Key
    const key = await getUserJudge0Key(user.id);

    return createResponse(200, { key: key || "" });
  } catch (err) {
    console.error("Error in getJudge0Key Lambda:", err);
    return createResponse(500, { error: "Internal Server Error" });
  }
};
