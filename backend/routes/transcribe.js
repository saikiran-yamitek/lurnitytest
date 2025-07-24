/******************** routes/transcribe.js  ********************/
import express from 'express';
import fetch   from 'node-fetch';

const router = express.Router();

/* POST /api/transcribe  { url:"https://…/video.mp4" } */
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });

    // 👉 talk to the Whisper micro‑service inside docker‑compose
    const resp = await fetch('http://whisper:9000/transcribe', {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({ url })
    });
    if (!resp.ok) throw new Error(await resp.text());

    const data = await resp.json();     // { transcript:"…" }
    res.json(data);
  } catch (err) {
    console.error('Whisper‑API error →', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
