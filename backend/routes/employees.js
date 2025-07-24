import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

/* ----- CREATE EMPLOYEE ----- */
router.post("/", async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    console.error("Error saving employee:", err);
    res.status(500).json({ message: "Server error creating employee" });
  }
});

/* ----- GET ALL EMPLOYEES ----- */
router.get("/", async (_req, res) => {
  try {
    const list = await Employee.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----- GET SINGLE EMPLOYEE ----- */
router.get("/:id", async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).lean();
    if (!emp) return res.status(404).json({ error: "Not found" });
    emp.password = ""; // don't send hashed password
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----- UPDATE EMPLOYEE ----- */
router.put("/:id", async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: "Not found" });

    Object.assign(emp, req.body);
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----- DELETE EMPLOYEE ----- */
router.delete("/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
