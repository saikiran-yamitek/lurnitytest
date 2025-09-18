import { getStreakData } from "../../models/User.js";
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

    const streakData = await getStreakData(userId);
    return createResponse(200, streakData);
  } catch (err) {
    return createResponse(500, { msg: "Error fetching streak data", error: err.message });
  }
};
