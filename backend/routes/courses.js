// backend/routes/courses.js
import express from 'express';
import Course from '../models/Course.js';

const router = express.Router();

/* helper – auto‑sum overallDuration if admin leaves it 0 */
const calcTotalMinutes = (subs = []) =>
  subs.reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0);

/* ---------- CREATE ---------- */
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.overallDuration) data.overallDuration = calcTotalMinutes(data.subCourses);

    const course = await Course.create(data);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- READ ALL ---------- */
router.get('/', async (_req, res) => {
  try {
    const courses = await Course.find().lean();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- READ ONE ---------- */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ error: 'Not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- UPDATE ---------- */
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.overallDuration) data.overallDuration = calcTotalMinutes(data.subCourses);

    const course = await Course.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });
    if (!course) return res.status(404).json({ error: 'Not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- DELETE ---------- */
router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
export default router;
