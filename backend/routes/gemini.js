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


router.post('/mock-questions', async (req, res) => {
  try {
    const { companyName, skills = [], userName = 'Candidate', geminiApiKey } = req.body;

    if (!geminiApiKey) {
      return res.status(400).json({ message: 'Missing geminiApiKey' });
    }
    if (!companyName) {
      return res.status(400).json({ message: 'Missing companyName' });
    }

    const skillsList = Array.isArray(skills) ? skills.filter(Boolean).slice(0, 12) : [];
    const skillLine = skillsList.length
      ? `Skills: ${skillsList.join(', ')}`
      : 'Skills: general software engineering';

    // Tight prompt to encourage pure JSON (no fences, no prose)
    const systemPrompt = `
You are generating a 30-question mock interview for a candidate applying to ${companyName}.
Candidate name: ${userName}.
${skillLine}.

Output requirements (STRICT):
- Output MUST be a single JSON object only. Do NOT include backticks, markdown code fences, or any prose outside the JSON.
- JSON shape MUST be exactly:
{
  "questions": [
    {
      "id": "string-unique",
      "type": "technical" | "scenario" | "best",
      "question": "string",
      "options": ["A", "B", "C", "D"], // optional, max 4 options for MCQ
      "answer": "string",              // concise correct answer or grading rubric
      "difficulty": "easy" | "medium" | "hard",
      "skillTag": "string (optional for technical)",
      "rationale": "string (brief explanation)"
    },
    ... 30 total objects ...
  ]
}

Content constraints:
- Exactly 30 questions:
  - 20 technical tailored to the candidate's skills (mix of MCQ and open-ended). Include "skillTag" indicating the targeted skill.
  - 5 scenario/behavioral questions relevant to ${companyName}'s environment (ambiguity, deadlines, teamwork, incidents, ownership).
  - 5 "best" curated/challenging questions (architecture, design trade-offs, debugging, performance).
- Difficulty distribution: ~30% easy, ~50% medium, ~20% hard.
- Avoid secrets. Do not include any commentary outside the JSON.
`;

    // Gemini 1.5 Flash text endpoint
    const geminiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ]
    };

    const r = await fetch(`${geminiUrl}?key=${encodeURIComponent(geminiApiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ message: 'Gemini API error', detail: txt });
    }

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';


    // Robust extractor to handle code fences, stray chars, BOM/zero-width, trailing commas
    const extractJson = (raw) => {
      if (!raw || typeof raw !== 'string') return null;
      let s = raw.trim();

      // Remove hidden unicode chars that can break JSON.parse
      s = s.replace(/\u200b|\u200c|\u200d|\ufeff|\xa0/g, '');

      // If fenced code block exists, extract content inside it
      const fenceMatch = s.match(/``````/i);
      if (fenceMatch) {
        s = fenceMatch[1].trim();
      } else {
        // Try slicing the first outermost object
        const start = s.indexOf('{');
        const end = s.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          s = s.slice(start, end + 1).trim();
        }
      }

      // Remove trailing commas (non-standard but common in LLM output)
      s = s.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    };

    let parsed = extractJson(text);
    if (!parsed || !Array.isArray(parsed.questions)) {
      return res.status(500).json({ message: 'Model did not return valid JSON', raw: text });
    }

    // Enforce exactly 30
    if (parsed.questions.length !== 30) {
      parsed.questions = parsed.questions.slice(0, 30);
    }

    // Sanitize and coerce
    const sanitized = parsed.questions.map((q, idx) => ({
      id: String(q?.id ?? `q_${idx + 1}`),
      type:
        q?.type === 'technical' || q?.type === 'scenario' || q?.type === 'best'
          ? q.type
          : 'technical',
      question: String(q?.question ?? '').slice(0, 1000),
      options: Array.isArray(q?.options)
        ? q.options.slice(0, 4).map((o) => String(o).slice(0, 200))
        : undefined,
      answer: q?.answer ? String(q.answer).slice(0, 1200) : '',
      difficulty:
        q?.difficulty === 'easy' || q?.difficulty === 'medium' || q?.difficulty === 'hard'
          ? q.difficulty
          : 'medium',
      skillTag: q?.skillTag ? String(q.skillTag).slice(0, 60) : undefined,
      rationale: q?.rationale ? String(q.rationale).slice(0, 1200) : ''
    }));

    return res.json({ questions: sanitized });
  } catch (err) {
    console.error('mock-questions error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
