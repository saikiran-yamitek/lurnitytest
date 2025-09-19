import jwt from "jsonwebtoken";
import { getResumeData } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    console.log("Headers:", JSON.stringify(event.headers, null, 2));

    const authHeader = event.headers?.authorization; // always lowercase
    const token = authHeader?.split(" ")[1];
    if (!token) return createResponse(401, { msg: "No token" });
const JWT_SECRET = process.env.JWT_SECRET || "secretKey";
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET); // 🔑 use same secret as in login
    } catch (err) {
      console.error("JWT verify failed:", err.message);
      return createResponse(401, { msg: "Invalid token", error: err.message });
    }

    const userId = event.pathParameters?.id || decoded.id;
    const data = await getResumeData(userId);
    if (!data) return createResponse(404, { msg: "User not found" });

    return createResponse(200, data);
  } catch (err) {
    console.error("Handler error:", err);
    return createResponse(500, { msg: "Error fetching user", error: err.message });
  }
};
