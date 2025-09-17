import jwt from "jsonwebtoken";
import { getUserById } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const token = event.headers?.authorization?.split(" ")[1];
    if (!token) return { statusCode: 401, body: JSON.stringify({ msg: "No token" }) };

    const decoded = jwt.verify(token, "secretKey");
    const user = await getUserById(decoded.id);

    if (!user) return { statusCode: 404, body: JSON.stringify({ msg: "User not found" }) };

    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      alertAvailable: user.alertAvailable,
      course: user.course,
      status: user.status,
      faceImage: user.faceImage || null,
      profileImage: user.photoURL || null,
      geminiApiKey: user.geminiApiKey,
    };

    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Server error", error: err.message }) };
  }
};
