import express from 'express';
import Certificate from '../models/Certificate.js';
import auth from './auth.js'; // Assuming JWT auth middleware
import User from '../models/User.js';
import Course from '../models/Course.js';
import fs from "fs";
import path from "path";


const router = express.Router();

// POST /api/certificates/generate
router.post('/generate', async (req, res) => {
  try {
    const { userId, courseId, subCourseTitle } = req.body;
    

    if (!userId || !courseId || !subCourseTitle) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await Certificate.findOne({ userId, courseId, subCourseTitle });
    if (existing) {
      return res.status(200).json({ message: "Certificate already issued.", certificate: existing });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });

    const subCourseExists = course.subCourses?.some(sc => sc.title === subCourseTitle);
    if (!subCourseExists) {
      return res.status(400).json({ message: "Sub-course not found in course." });
    }

    const cert = new Certificate({
      userId,
      courseId,
      subCourseTitle
    });

    await cert.save();
    return res.status(201).json({ message: "Certificate issued.", certificate: cert });
  } catch (error) {
    console.error("❌ Certificate issue error:", error);
    if (error.code === 11000) {
      return res.status(200).json({ message: "Duplicate certificate ignored." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
});




router.get('/', async (req, res) => {
  try {
    const certs = await Certificate.find(); // OR filter by hardcoded userId temporarily
    res.status(200).json(certs);
  } catch (err) {
    console.error("Get cert error:", err); // log it!
    res.status(500).json({ message: "Failed to fetch certificates." });
  }
});

// GET certificate by ID
router.get("/:id", async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).lean();
    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    const user = await User.findById(cert.userId).lean();
    cert.userName = user?.name || "User";

    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// In your certificateRoutes.js
router.get('/user/:userId',  async (req, res) => {
  const certs = await Certificate.find({ userId: req.params.userId });
  res.json(certs);
});




export default router;
