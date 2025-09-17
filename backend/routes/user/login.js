import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  findUserByEmail,
} from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { email, password } = body;

    if (!email || !password) {
      return createResponse(400, { error: "Email and password required" });
    }

    // 1) Lookup user
    const user = await findUserByEmail(email);
    if (!user) {
      return createResponse(400, { error: "Invalid credentials" });
    }

    // 2) Password check
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return createResponse(400, { error: "Invalid credentials" });
    }

    // 3) Status checks
    if (user.status === "suspended") {
      return createResponse(403, {
        error: "Your account is suspended. Please contact support.",
      });
    }

    if (user.status === "banned") {
      return createResponse(403, { error: "This account has been banned." });
    }

    // 4) Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5) Success response
    return createResponse(200, {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        course: user.course,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return createResponse(500, { error: "Server error logging in" });
  }
};
