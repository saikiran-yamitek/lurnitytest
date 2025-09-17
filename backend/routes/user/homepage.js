import jwt from "jsonwebtoken";
import { getUserById } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Check both lowercase and uppercase Authorization headers
    const authHeader = event.headers?.authorization || 
                      event.headers?.Authorization ||
                      event.headers?.['authorization'] ||
                      event.headers?.['Authorization'];
    
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return createResponse(401, { msg: "No token" });
    }

    // ✅ Use same secret as login Lambda
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await getUserById(decoded.id);

    if (!user) {
      return createResponse(404, { msg: "User not found" });
    }

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

    return createResponse(200, response);
  } catch (err) {
    console.error("Homepage error:", err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return createResponse(401, { msg: "Invalid or expired token", error: err.message });
    }
    return createResponse(500, { msg: "Server error", error: err.message });
  }
};
