// routes/workshop.js
import { Router } from "express";
import Workshop from "../models/Workshop.js";

const router = Router();

// GET all workshops
router.get("/", async (_req, res) => {
  try {
    const list = await Workshop.find()
      .populate("inchargeId", "name")
      
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("❌ Failed to fetch workshops:", err.message); 
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /api/workshops - create new workshop
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const newWorkshop = new Workshop(data);
    await newWorkshop.save();
    res.status(201).json(newWorkshop);
  } catch (err) {
    console.error("Workshop creation error:", err.message); // 👀 LOG THIS
    res.status(500).json({ error: err.message });
  }
});

// ✅ Register to workshop
// routes/workshop.js
router.post("/:id/register", async (req, res) => {
  try {
    const workshopId = req.params.id;
    const { userId } = req.body;

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ error: "Workshop not found" });
    }

    // Check if already registered properly
    const alreadyRegistered = workshop.registeredStudents.some(
      (entry) => entry.student.toString() === userId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ error: "Already registered" });
    }

    // Check capacity
    if (workshop.registeredStudents.length >= workshop.capacity) {
      return res.status(400).json({ error: "Workshop is full" });
    }

    // Register
    workshop.registeredStudents.push({ student: userId });
    await workshop.save();

    res.status(200).json({ message: "Registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/user/:userId/workshops", async (req, res) => {
  const u = req.params.userId;
  const workshops = await Workshop.find({
    "registeredStudents.student": u
  }).populate("inchargeId", "name");
  const arr = workshops.map(w => {
    const entry = w.registeredStudents.find(e =>
      e.student.toString() === u
    );
    return {
      id: w._id,
      labName: w.labName,
      labAddress: w.labAddress,
      time: w.time,
      attendance: entry.attendance,
      result: entry.result,
      registeredAt: entry.registeredAt,
      inchargeName: w.inchargeId.name,
    };
  });
  res.json(arr);
});





// GET /api/workshops/:id/students
// GET /api/workshops/:id/students
// GET /api/workshops/:id/students
router.get("/:id/students", async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id).populate("registeredStudents.student", "name email phone");

    if (!workshop) return res.status(404).json({ message: "Workshop not found" });

    const students = workshop.registeredStudents.map((entry) => {
      const { student, attendance, result,grade } = entry; // FIX: include these from entry, not student

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        attendance, // FIX: read from entry not student
        result,
        grade    // FIX: read from entry not student
      };
    });

    res.json(students);
  } catch (err) {
    console.error("Error fetching registered students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});



router.delete("/:id", async (req, res) => {
  try {
    await Workshop.findByIdAndDelete(req.params.id);
    res.json({ message: "Workshop deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete workshop" });
  }
});

// GET /api/workshops/incharge/:empId
router.get("/incharge/:empId", async (req, res) => {
  try {
    const workshops = await Workshop.find({ inchargeId: req.params.empId })
      .populate("registeredStudents", "name email phone")
      .populate("inchargeId", "name");

    res.json(workshops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/workshops/:id/attendance
router.put("/:id/attendance", async (req, res) => {
  const { studentId, attendance, status,result ,grade} = req.body;

  const workshop = await Workshop.findById(req.params.id);
  const student = workshop.registeredStudents.find(
    (s) => s.student.toString() === studentId
  );

  if (!student) return res.status(404).send("Student not found");

  if (attendance !== undefined) student.attendance = attendance;
  if (status !== undefined) student.status = status;
  if (result !== undefined) student.result = result;
  if (grade !== undefined) student.grade = grade;

  await workshop.save();

  res.send("Student updated");
});



// ✅ PUT /api/workshops/:id/register - Updated version to handle duplicate check properly
router.put("/:id/register", async (req, res) => {
  try {
    const { userId } = req.body;
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ error: "Workshop not found" });
    }

    const alreadyRegistered = workshop.registeredStudents.some(
      (entry) => entry.student.toString() === userId
    );

    if (alreadyRegistered) {
      return res.status(200).json({ message: "Already registered" });
    }

    // Optional: You can also check for capacity here if needed
    if (workshop.registeredStudents.length >= workshop.memberCount) {
      return res.status(400).json({ error: "Workshop is full" });
    }

    workshop.registeredStudents.push({
      student: userId,
      attendance: false,
      result: "pending",
      registeredAt: new Date()
    });

    await workshop.save();
    res.status(200).json({ message: "Registration successful" });
  } catch (err) {
    console.error("Registration PUT error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedWorkshop = await Workshop.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedWorkshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }

    res.json(updatedWorkshop);
  } catch (err) {
    console.error("❌ Workshop update error:", err.message);
    res.status(500).json({ error: 'Failed to update workshop', details: err.message });
  }
});



export default router;
