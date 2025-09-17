import jwt from "jsonwebtoken";
import { getResumeData } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const token = event.headers?.authorization?.split(" ")[1];
    if (!token) return { statusCode: 401, body: JSON.stringify({ msg: "No token" }) };

    const decoded = jwt.verify(token, "secretKey");
    const userId = event.queryStringParameters?.userId || decoded.id;

    const data = await getResumeData(userId);
    if (!data) return { statusCode: 404, body: JSON.stringify({ msg: "User not found" }) };

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ msg: "Error fetching user", error: err.message }) };
  }
};
