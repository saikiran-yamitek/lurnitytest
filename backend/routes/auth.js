import { OAuth2Client } from "google-auth-library";
import express from 'express';
import jwt     from 'jsonwebtoken';
import bcrypt  from 'bcryptjs';
import User    from '../models/User.js';

const client = new OAuth2Client(
  "322821846367-514od8575kmib97gji4q88ntskndmo9b.apps.googleusercontent.com"
);

const router = express.Router();

/* ---------- POST /api/auth/login ---------- */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    /* 1) look up user */
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: 'Invalid credentials' });

    /* 2) password check */
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ error: 'Invalid credentials' });

    /* 3) status gate */
    if (user.status === 'suspended')
      return res.status(403).json({
        error: 'Your account is suspended. Please contact support.'
      });

    if (user.status === 'banned')
      return res.status(403).json({
        error: 'This account has been banned.'
      });

    /* 4) create token */
    const token = jwt.sign(
      { id: user._id,  email: user.email,role: user.role },
      'secretKey',
      { expiresIn: '1d' }
    );

    /* 5) success response */
    res.json({
      message: 'Login successful',
      token,
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        status: user.status,
        course: user.course
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error logging in' });
  }
});


router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "322821846367-514od8575kmib97gji4q88ntskndmo9b.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.json({ success: false, msg: "User not registered" });
    }

    const appToken = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      "secretKey",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token: appToken,
      user: { id: existingUser._id, email: existingUser.email },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(400).json({ success: false, msg: "Invalid Google login" });
  }
});

export default router;
