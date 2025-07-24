import { Router } from "express";
import jwt         from "jsonwebtoken";
import User        from "../models/User.js";

const router  = Router();
const SECRET  = process.env.JWT_SECRET || "secretKey";

/* helper: extract userId from Authorization header */
function getUserId(req, res) {
  const hdr = req.headers.authorization || req.headers.Authorization || "";
  if (!hdr.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token" });
    return null;
  }
  const token = hdr.split(" ")[1];
  try {
    const { id } = jwt.verify(token, SECRET);
    return id;
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
}

/* GET /api/progress  →  ["COURSE|sub|vid", …] */
router.get("/", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;                       // response already sent

  const user = await User.findById(userId).select("watchedVideos");
  res.json(user?.watchedVideos || []);
});

/* POST /api/progress/watch  { videoId } */
router.post("/watch", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;                       // response already sent

  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: "videoId required" });

  const user = await User.findById(userId);
  if (!user.watchedVideos.includes(videoId)) {
    user.watchedVideos.push(videoId);
    await user.save();
  }
  res.json({ ok: true });
});

export default router;
