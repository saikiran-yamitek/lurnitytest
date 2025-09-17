import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAdminByUsername } from "../../models/AdminLogin.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { username, password } = body;

    if (!username || !password) {
      return createResponse(400, { message: "All fields are required" });
    }

    const admin = await getAdminByUsername(username);
    if (!admin) {
      return createResponse(401, { message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return createResponse(401, { message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.ADMIN_JWT_SECRET || "admin-secret-key",
      { expiresIn: "1d" }
    );

    return createResponse(200, { token });
  } catch (err) {
    console.error("Login error:", err);
    return createResponse(500, { message: "Server error" });
  }
};
