import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

router.post('/submit', async (req, res) => {
  try {
    const { userId, courseId, subIndex, videoIndex, rating, comment } = req.body;

    const feedback = new Feedback({ userId, courseId, subIndex, videoIndex, rating, comment });
    await feedback.save();

    res.status(201).json({ message: 'Feedback saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// feedbackRoutes.js
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name') // Populate only the name field of the user
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});


export default router;
