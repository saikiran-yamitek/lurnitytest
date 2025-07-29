
//---------------------------------------------------------------
import express  from 'express';
import jwt      from 'jsonwebtoken';
import bcrypt   from 'bcryptjs';
import User     from '../models/User.js';



//---------------------------------------------------------------
// 2)  load models ONCE, right now (paths relative to backend root)
//---------------------------------------------------------------


const router = express.Router();

/* ------------------------------------------------------------------
   Registration  (unchanged)
------------------------------------------------------------------ */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name, email, password: hashed, phone,
      role:'user', status:'active'
    });
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Registration error' });
  }
});

/* ------------------------------------------------------------------
   Face ENROLMENT  POST /api/users/:id/face
------------------------------------------------------------------ */


/* ------------------------------------------------------------------
   Face VERIFY     POST /api/users/:id/verify-face
------------------------------------------------------------------ */


/* ------------------------------------------------------------------
   Homepage (unchanged)
------------------------------------------------------------------ */
router.get('/homepage', async (req, res) => {
  try {
    const raw   = req.headers.authorization || '';
    const token = raw.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token' });

    const decoded = jwt.verify(token, 'secretKey');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({
      id:user._id, name:user.name, email:user.email,alertAvailable:user.alertAvailable,
      course:user.course, status:user.status, faceImage:user.faceImage||null,profileImage: user.photoURL || null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get("/get-resume-data", async (req, res) => {
  try {
    const raw = req.headers.authorization || "";
    const token = raw.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, "secretKey");
    const userId = req.query.userId || decoded.id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user", error: err.message });
  }
});


router.put('/update-completed-subcourses', async (req, res) => {
  const { userId, subCourseTitle } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.completedSubcourses.includes(subCourseTitle)) {
      user.completedSubcourses.push(subCourseTitle);
      await user.save();
    }

    res.json({ message: "Completed subcourse updated", completedSubcourses: user.completedSubcourses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/setAlert', async (req, res) => {
  const { email, alert } = req.body;
  try {
    await User.updateOne({ email }, { alertAvailable: alert });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------------- Set ticketId by email (alternate route) ----------------------

// routes/userRoutes.js

router.put("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/user/:id/profile
// GET /api/user/:id/profile
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post("/update-projects", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secretKey"); // ✅ match with other routes
    const userId = decoded.id; // ✅ not userId
    const { projects } = req.body;

    if (!Array.isArray(projects)) {
      return res.status(400).json({ message: "Invalid projects format" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { projects },
      { new: true }
    );

    res.json({ message: "Projects updated successfully", projects: user.projects });
  } catch (err) {
    console.error("Error updating projects:", err);
    res.status(500).json({ message: "Server error" });
  }
});






export default router;





