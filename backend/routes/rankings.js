// routes/rankings.js
import express from "express";
import Workshop from "../models/Workshop.js";
import User from "../models/User.js";

const router = express.Router();

// Helper: lab grade ranking
const gradeOrder = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

import Placement from "../models/Placement.js";

router.get("/", async (req, res) => {
  try {
    const { sortBy = "lab" } = req.query;

    // 1️⃣ Find all placed student IDs
    const placedStudents = await Placement.aggregate([
      { $unwind: "$registered" },
      { $match: { "registered.status": "PLACED" } },
      { $group: { _id: "$registered.student" } }
    ]);
    const placedIds = placedStudents.map(s => s._id.toString());

    // 2️⃣ Get workshop students
    const workshops = await Workshop.find({})
      .populate("registeredStudents.student", "name email bachelorsDegree");

    let studentMap = new Map();

    workshops.forEach(w => {
      w.registeredStudents.forEach(s => {
        const studentId = s.student._id.toString();

        // ❌ Skip if student is placed
        if (placedIds.includes(studentId)) return;

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            _id: s.student._id,
            name: s.student.name,
            email: s.student.email,
            bachelors: s.student.bachelorsDegree || {},
            labGrade: s.grade
          });
        }
      });
    });

    let students = Array.from(studentMap.values());

    // 3️⃣ Sorting
    students.sort((a, b) => {
      if (sortBy === "lab") {
        const gA = gradeOrder[a.labGrade] || 0;
        const gB = gradeOrder[b.labGrade] || 0;
        if (gB !== gA) return gB - gA;

        const cA = a.bachelors?.cgpa || a.bachelors?.percentage || 0;
        const cB = b.bachelors?.cgpa || b.bachelors?.percentage || 0;
        return cB - cA;
      } else {
        const cA = a.bachelors?.cgpa || a.bachelors?.percentage || 0;
        const cB = b.bachelors?.cgpa || b.bachelors?.percentage || 0;
        if (cB !== cA) return cB - cA;

        const gA = gradeOrder[a.labGrade] || 0;
        const gB = gradeOrder[b.labGrade] || 0;
        return gB - gA;
      }
    });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rankings" });
  }
});

export default router;
