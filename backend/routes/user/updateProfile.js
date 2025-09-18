import { updateUserProfile } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptionsRequest();

  const userId = event.pathParameters?.id;
  const body = event.body ? JSON.parse(event.body) : {};

  if (!userId) return createResponse(400, { msg: "userId required" });

  // 🚫 Remove id/userId from body so DB doesn’t try to overwrite the key
  delete body.id;
  delete body.userId;

  const updateFields = body;

  try {
    const updated = await updateUserProfile(userId, updateFields);
    return createResponse(200, updated);
  } catch (err) {
    console.error("Update failed:", err);
    return createResponse(500, { msg: "Internal Server Error" });
  }
};
