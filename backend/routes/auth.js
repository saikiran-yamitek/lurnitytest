import express from 'express';
import jwt     from 'jsonwebtoken';
import bcrypt  from 'bcryptjs';
import User    from '../models/User.js';

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




export default router;
