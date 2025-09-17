import { updateUserProfile } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, ...updateFields } = body;

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ msg: "userId required" }) };
    }

    const updated = await updateUserProfile(userId, updateFields);
    return { statusCode: 200, body: JSON.stringify(updated) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error updating profile", error: err.message }) };
  }
};
