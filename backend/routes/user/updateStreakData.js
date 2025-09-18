import { updateStreakData } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, streakData } = body;

    const updated = await updateStreakData(userId, streakData);
    return createResponse(200, { streakData: updated });
  } catch (err) {
    return createResponse(500, { msg: "Error updating streak data", error: err.message });
  }
};
