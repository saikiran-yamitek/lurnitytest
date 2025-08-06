import express from 'express';
import Placement from '../models/Placement.js';
import User from '../models/User.js';

const router = express.Router();

// List all placement drives
router.get('/', async (req, res) => {
  const drives = await Placement.find().populate('registered.student');
  res.json(drives);
});


// Create a new drive
router.post('/', async (req, res) => {
  const newDrive = await Placement.create(req.body);
  res.json(newDrive);
});

// Get students for a drive
router.get('/:id/students', async (req, res) => {
  try {
    const drive = await Placement.findById(req.params.id)
      .populate('registered.student');

    if (!drive) return res.status(404).json({ message: "Drive not found" });

    // Merge student details with metadata
    const enrichedStudents = drive.registered.map((entry) => ({
      _id: entry.student._id,
      name: entry.student.name,
      email: entry.student.email,
      phone: entry.student.phone,
      status: entry.status,
      remarks: entry.remarks,
      offerLetterURL: entry.offerLetterURL
    }));

    res.json(enrichedStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});


// Delete a drive
router.delete('/:id', async (req, res) => {
  await Placement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

router.post("/register/:driveId", async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  try {
    const placement = await Placement.findById(req.params.driveId);
    if (!placement) {
      return res.status(404).json({ message: "Drive not found" });
    }

    const alreadyRegistered = placement.registered.find((r) => r.student.toString() === studentId);
    if (alreadyRegistered) {
      return res.status(400).json({ message: "You have already applied for this drive" });
    }

    placement.registered.push({
      student: studentId,
      status: "NOT PLACED",
      remarks: "",
      offerLetterURL: ""
    });

    await placement.save();

    res.status(200).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Error registering student:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Placement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// Update student status, remarks, offerLetterURL
router.put('/:driveId/students/:studentId', async (req, res) => {
  const { status, remarks, offerLetterURL } = req.body;

  try {
    const placement = await Placement.findById(req.params.driveId);
    if (!placement) return res.status(404).json({ message: "Drive not found" });

    const studentEntry = placement.registered.find(
      (r) => r.student.toString() === req.params.studentId
    );

    if (!studentEntry) return res.status(404).json({ message: "Student not registered for this drive" });

    studentEntry.status = status || studentEntry.status;
    studentEntry.remarks = remarks || "";
    studentEntry.offerLetterURL = status === "PLACED" ? offerLetterURL : "";

    await placement.save();

    res.json({ message: "Student status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update student info" });
  }
});

// Mark a drive as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const updated = await Placement.findByIdAndUpdate(
      req.params.id,
      { status: 'COMPLETED' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to complete drive" });
  }
});

// Revoke a completed drive
router.put('/:id/revoke', async (req, res) => {
  try {
    const updated = await Placement.findByIdAndUpdate(
      req.params.id,
      { status: 'SCHEDULED' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to revoke drive" });
  }
});


export default router;
