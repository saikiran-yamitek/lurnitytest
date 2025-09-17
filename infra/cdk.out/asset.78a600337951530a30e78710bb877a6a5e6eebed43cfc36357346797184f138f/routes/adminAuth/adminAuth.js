import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAdminByUsername } from "../../models/AdminLogin.js"; // helper from AdminLogin.js

export const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "All fields are required" }),
      };
    }

    const admin = await getAdminByUsername(username);
    if (!admin) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.ADMIN_JWT_SECRET || "admin-secret-key",
      { expiresIn: "1d" }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error" }),
    };
  }
};
