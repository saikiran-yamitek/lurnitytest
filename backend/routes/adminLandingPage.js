import express from 'express';
import LandingPage from '../models/LandingPage.js';

const router = express.Router();

// Ensure there is always one landing page document
async function getLandingPage() {
  let page = await LandingPage.findOne();
  if (!page) {
    page = new LandingPage({ cohorts: [] });
    await page.save();
  }
  return page;
}

// GET cohorts
router.get('/cohorts', async (req, res) => {
  try {
    const page = await getLandingPage();
    res.json(page.cohorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE cohort
router.post('/cohorts', async (req, res) => {
  try {
    const page = await getLandingPage();
    page.cohorts.push(req.body);
    await page.save();
    res.json(page.cohorts[page.cohorts.length - 1]); // return new cohort
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE cohort
router.put('/cohorts/:id', async (req, res) => {
  try {
    const page = await getLandingPage();
    const cohort = page.cohorts.id(req.params.id);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });

    Object.assign(cohort, req.body);
    await page.save();
    res.json(cohort);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE cohort
router.delete('/cohorts/:id', async (req, res) => {
  try {
    const page = await getLandingPage();
    const cohort = page.cohorts.id(req.params.id);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });

    cohort.deleteOne(); // ✅ instead of .remove() (deprecated)
    await page.save();
    res.json({ message: 'Cohort deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
