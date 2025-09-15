// user/login.js

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  findUserByEmail,
} from "../../models/User.js"; // helper we added

const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and password required" }),
      };
    }

    // 1) Lookup user
    const user = await findUserByEmail(email);
    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // 2) Password check
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // 3) Status checks
    if (user.status === "suspended") {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Your account is suspended. Please contact support.",
        }),
      };
    }

    if (user.status === "banned") {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "This account has been banned." }),
      };
    }

    // 4) Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5) Success response
    return {
      statusCode: 200,
      body: JSON.stringify({
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
      }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error logging in" }),
    };
  }
};
