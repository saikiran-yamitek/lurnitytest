// backend/utils/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET; // must match the one used for signing tokens

export const verifyToken = (event) => {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("Invalid Authorization header");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // token is valid, you can use decoded if needed
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};
