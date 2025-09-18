import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAdminByUsername } from "../../models/AdminLogin.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";


// In your admin auth Lambda function (adminAuth.js)
export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { username, password } = body;

    console.log('🔍 Debug - Request received:', { username, hasPassword: !!password });

    if (!username || !password) {
      console.log('❌ Missing credentials');
      return createResponse(400, { message: "All fields are required" });
    }

    console.log('🔍 Looking up admin:', username);
    const admin = await getAdminByUsername(username);
    console.log('🔍 Admin found:', !!admin, admin ? { username: admin.username, hasPassword: !!admin.password } : null);

    if (!admin) {
      console.log('❌ Admin not found');
      return createResponse(401, { message: "Invalid credentials" });
    }

    console.log('🔍 Comparing passwords...');
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('🔍 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password mismatch');
      return createResponse(401, { message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id || admin._id },
      process.env.ADMIN_JWT_SECRET || "admin-secret-key",
      { expiresIn: "1d" }
    );

    console.log('✅ Authentication successful');
    return createResponse(200, { token });
  } catch (err) {
    console.error("Login error:", err);
    return createResponse(500, { message: "Server error" });
  }
};

