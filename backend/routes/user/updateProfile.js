import { updateUserProfile } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  // userId comes from the route /user/{userId}/profile
  const userId = event.pathParameters?.userId;   // <─ NEW
  const body = event.body ? JSON.parse(event.body) : {};
  const updateFields = body;                     // everything else

  if (!userId) return createResponse(400, { msg: "userId required" });

  const updated = await updateUserProfile(userId, updateFields);
  return createResponse(200, updated);
};

