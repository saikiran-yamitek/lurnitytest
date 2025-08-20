// routes/landingPageRoutes.js
import express from 'express';
import LandingPage from '../models/LandingPage.js';

const router = express.Router();

// Get cohorts
router.get('/cohorts', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne().sort({ lastUpdated: -1 });
    if (!landingPage) {
      return res.status(404).json({ message: 'No cohorts found' });
    }
    res.json(landingPage.cohorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne().sort({ lastUpdated: -1 });
    if (!landingPage) {
      return res.status(404).json({ message: 'No jobs found' });
    }
    res.json(landingPage.jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new job
router.post('/jobs', async (req, res) => {
  try {
    let landingPage = await LandingPage.findOne().sort({ lastUpdated: -1 });
    if (!landingPage) {
      landingPage = new LandingPage({ jobs: [] });
    }
    
    const newJob = {
      ...req.body,
      createdAt: new Date()
    };
    
    landingPage.jobs.push(newJob);
    landingPage.lastUpdated = new Date();
    await landingPage.save();
    
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a job
router.put('/jobs/:id', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne().sort({ lastUpdated: -1 });
    if (!landingPage) {
      return res.status(404).json({ message: 'No jobs found' });
    }
    
    const jobIndex = landingPage.jobs.findIndex(j => j._id.toString() === req.params.id);
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    landingPage.jobs[jobIndex] = {
      ...landingPage.jobs[jobIndex].toObject(),
      ...req.body,
      _id: landingPage.jobs[jobIndex]._id
    };
    
    landingPage.lastUpdated = new Date();
    await landingPage.save();
    
    res.json(landingPage.jobs[jobIndex]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update job status
router.put('/jobs/:id/status', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne().sort({ lastUpdated: -1 });
    if (!landingPage) {
      return res.status(404).json({ message: 'No jobs found' });
    }
    
    const jobIndex = landingPage.jobs.findIndex(j => j._id.toString() === req.params.id);
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    landingPage.jobs[jobIndex].isActive = req.body.isActive;
    landingPage.lastUpdated = new Date();
    await landingPage.save();
    
    res.json(landingPage.jobs[jobIndex]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a job
router.delete('/jobs/:id', async (req, res) => {
  try {
    const landingPage = await LandingPage.findOne().sort({ lastUpdated: -1 });
    if (!landingPage) {
      return res.status(404).json({ message: 'No jobs found' });
    }
    
    const initialLength = landingPage.jobs.length;
    landingPage.jobs = landingPage.jobs.filter(j => j._id.toString() !== req.params.id);
    
    if (landingPage.jobs.length === initialLength) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    landingPage.lastUpdated = new Date();
    await landingPage.save();
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:jobId/apply', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email, contactNumber, resumeUrl } = req.body;

    const landingPage = await LandingPage.findOne({ "jobs._id": jobId });
    if (!landingPage) {
      return res.status(404).json({ message: "Job not found" });
    }

    const job = landingPage.jobs.id(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.applications.push({ name, email, contactNumber, resumeUrl });

    await landingPage.save();

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
});




export default router;
