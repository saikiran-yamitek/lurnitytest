import { getUserById } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return createResponse(400, { msg: "userId required" });
    }

    const user = await getUserById(userId);
    if (!user) return createResponse(404, { msg: "User not found" });

    return createResponse(200, user);
  } catch (err) {
    return createResponse(500, { msg: "Error fetching user", error: err.message });
  }
};
