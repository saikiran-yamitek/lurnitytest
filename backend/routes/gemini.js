import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ✅ Save Gemini API key for a user
router.post("/save-key", async (req, res) => {
  const { userId, geminiApiKey } = req.body;
  console.log("📥 Received in /save-key:", { userId, geminiApiKey }); 

  if (!userId || !geminiApiKey) {
    return res.status(400).json({ error: "userId and geminiApiKey are required" });
  }

  try {
    await User.findByIdAndUpdate(userId, { geminiApiKey });
    res.json({ message: "Gemini API key saved successfully" });
  } catch (err) {
    console.error("❌ Error saving Gemini key:", err);
    res.status(500).json({ error: "Failed to save key" });
  }
});

// ✅ Fetch Gemini API key for a user
router.post("/get-key", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ geminiApiKey: user.geminiApiKey || null });
  } catch (err) {
    console.error("❌ Error fetching Gemini key:", err);
    res.status(500).json({ error: "Failed to fetch key" });
  }
});

export default router;
