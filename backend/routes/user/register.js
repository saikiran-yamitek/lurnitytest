// lambdas/auth/register.js
import crypto from 'crypto';
import { createUser, findUserByEmail, findUserByPhone } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+\d{1,4}\d{6,15}$/;
const normalizePhone = (s='') => s.replace(/\s|-/g, '').replace(/^\+?/, '+');

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword ?? body.password ?? '');
    const phone = normalizePhone(String(body.phone || ''));

    // Basic validations to mirror frontend
    if (!name) return createResponse(400, { msg: "Name is required." });
    if (!emailRegex.test(email)) return createResponse(400, { msg: "Invalid email format." });
    if (password.length < 10) return createResponse(400, { msg: "Password must be at least 10 characters." });
    if (password !== confirmPassword) return createResponse(400, { msg: "Passwords do not match." });
    if (!phoneRegex.test(phone)) {
      return createResponse(400, { msg: "Please include a valid country code in your phone number, e.g., +91xxxxxxxxxx" });
    }

    // Uniqueness checks
    const [emailUser, phoneUser] = await Promise.all([
      findUserByEmail(email),
      findUserByPhone(phone)
    ]);

    if (emailUser) return createResponse(409, { msg: "Email already used" });
    if (phoneUser) return createResponse(409, { msg: "Phone number already used" });

    // Create user (createUser hashes password)
    await createUser({
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      name,
      email,
      phone,
      password
    });

    return createResponse(201, { msg: "User registered successfully" });
  } catch (err) {
    // Re-check on error to surface specific conflict in rare race condition
    try {
      const body = JSON.parse(event.body || '{}');
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const [e2, p2] = await Promise.all([
        email ? findUserByEmail(email) : null,
        phone ? findUserByPhone(phone) : null
      ]);
      if (e2) return createResponse(409, { msg: "Email already used" });
      if (p2) return createResponse(409, { msg: "Phone number already used" });
    } catch (_) {}
    return createResponse(500, { msg: "Registration error", error: err.message });
  }
};
