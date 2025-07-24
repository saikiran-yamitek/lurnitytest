import express  from "express";
import bcrypt   from "bcryptjs";
import Employee from "../models/Employee.js";

const router = express.Router();

/* POST /api/employees/login
   Body: { username, password }
   Res : { name, role }
-----------------------------------------------*/
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username & password required" });

  const emp = await Employee.findOne({ username });
  if (!emp) return res.status(400).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, emp.password);
  if (!ok)  return res.status(400).json({ error: "Invalid credentials" });

  res.json({ name: emp.name, role: emp.role ,id: emp.id,});
});

export default router;
