import jwt from "jsonwebtoken";
import { getResumeData } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const token = event.headers?.authorization?.split(" ")[1];
    if (!token) return createResponse(401, { msg: "No token" });

    const decoded = jwt.verify(token, "secretKey");
    const userId = event.queryStringParameters?.userId || decoded.id;

    const data = await getResumeData(userId);
    if (!data) return createResponse(404, { msg: "User not found" });

    return createResponse(200, data);
  } catch (err) {
    return createResponse(500, { msg: "Error fetching user", error: err.message });
  }
};
