import express from "express";
import Demo from "../models/Demo.js";
const router = express.Router();

// Create a demo booking
router.post("/book", async (req, res) => {
  try {
    const demo = new Demo(req.body);
    await demo.save();
    res.status(201).json({ message: "Demo booked successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all demo bookings
router.get("/bookings", async (req, res) => {
  try {
    const demos = await Demo.find().sort({ createdAt: -1 });
    res.json(demos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Mark as booked
router.put("/booked/:id", async (req, res) => {
  try {
    await Demo.findByIdAndUpdate(req.params.id, { booked: true });
    res.json({ message: "Demo marked as booked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
