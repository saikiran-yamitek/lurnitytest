import { Router } from "express";
import jwt         from "jsonwebtoken";
import User        from "../models/User.js";

const router  = Router();
const SECRET  = process.env.JWT_SECRET || "secretKey";

/* helper – verify token, return user */
async function getUser(req, res) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.split(" ")[1];
    const { id } = jwt.verify(token, SECRET);
    return await User.findById(id);
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}

/* GET /api/key → { key:"..." } */
router.get("/", async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;
  res.json({ key: user.judge0Key || "" });
});

/* POST /api/key  { key } */
router.post("/", async (req, res) => {
  const user = await getUser(req, res);
  if (!user) return;

  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Key required" });

  user.judge0Key = key.trim();
  await user.save();
  res.json({ ok: true });
});

export default router;
