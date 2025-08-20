
//---------------------------------------------------------------
import express  from 'express';
import jwt      from 'jsonwebtoken';
import bcrypt   from 'bcryptjs';
import User     from '../models/User.js';



//---------------------------------------------------------------
// 2)  load models ONCE, right now (paths relative to backend root)
//---------------------------------------------------------------


const router = express.Router();

/* ------------------------------------------------------------------
   Registration  (unchanged)
------------------------------------------------------------------ */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name, email, password: hashed, phone,
      role:'user', status:'active'
    });
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Registration error' });
  }
});

/* ------------------------------------------------------------------
   Face ENROLMENT  POST /api/users/:id/face
------------------------------------------------------------------ */


/* ------------------------------------------------------------------
   Face VERIFY     POST /api/users/:id/verify-face
------------------------------------------------------------------ */


/* ------------------------------------------------------------------
   Homepage (unchanged)
------------------------------------------------------------------ */
router.get('/homepage', async (req, res) => {
  try {
    const raw   = req.headers.authorization || '';
    const token = raw.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token' });

    const decoded = jwt.verify(token, 'secretKey');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    

    res.json({
      id:user._id, name:user.name, email:user.email,alertAvailable:user.alertAvailable,
      course:user.course, status:user.status, faceImage:user.faceImage||null,profileImage: user.photoURL || null,
      geminiApiKey:user.geminiApiKey,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});



router.get("/get-resume-data", async (req, res) => {
  try {
    const raw = req.headers.authorization || "";
    const token = raw.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, "secretKey");
    const userId = req.query.userId || decoded.id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user", error: err.message });
  }
});


router.put('/update-completed-subcourses', async (req, res) => {
  const { userId, subCourseTitle } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.completedSubcourses.includes(subCourseTitle)) {
      user.completedSubcourses.push(subCourseTitle);
      await user.save();
    }

    res.json({ message: "Completed subcourse updated", completedSubcourses: user.completedSubcourses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/setAlert', async (req, res) => {
  const { email, alert } = req.body;
  try {
    await User.updateOne({ email }, { alertAvailable: alert });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------------- Set ticketId by email (alternate route) ----------------------

// routes/userRoutes.js

router.put("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Create a clean update object that only contains fields that are actually being updated
    const cleanUpdate = {};
    
    // Helper function to clean nested objects
    const cleanNestedObject = (obj) => {
      const result = {};
      for (const key in obj) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
          if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const nested = cleanNestedObject(obj[key]);
            if (Object.keys(nested).length > 0) {
              result[key] = nested;
            }
          } else {
            result[key] = obj[key];
          }
        }
      }
      return result;
    };

    // Clean the update fields
    for (const key in updateFields) {
      if (updateFields[key] !== undefined && updateFields[key] !== null && updateFields[key] !== '') {
        if (typeof updateFields[key] === 'object' && !Array.isArray(updateFields[key])) {
          const nested = cleanNestedObject(updateFields[key]);
          if (Object.keys(nested).length > 0) {
            cleanUpdate[key] = nested;
          }
        } else {
          cleanUpdate[key] = updateFields[key];
        }
      }
    }

    // Perform the update with validation only on the fields being updated
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: cleanUpdate },
      { 
        new: true,
        runValidators: true,
        context: 'query',
        // Only validate the fields that are being modified
        validateModifiedOnly: true
      }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Update Error:", error);
    
    if (error.name === 'ValidationError') {
      // Format validation errors for better client-side handling
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ 
        message: "Validation failed",
        errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid data format",
        field: error.path,
        value: error.value
      });
    }
    
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/user/:id/profile
// GET /api/user/:id/profile - Updated version
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Transform data to match frontend structure
    const profileData = {
      ...user,
      tenthStandard: {
        ...user.tenthStandard,
        board: user.tenthStandard?.board,
        profileLock: user.profileLock, // Map tenthBoard to board
      },
      // Add other transformations as needed
    };

    res.json(profileData);
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post("/update-projects", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secretKey"); // ✅ match with other routes
    const userId = decoded.id; // ✅ not userId
    const { projects } = req.body;

    if (!Array.isArray(projects)) {
      return res.status(400).json({ message: "Invalid projects format" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { projects },
      { new: true }
    );

    res.json({ message: "Projects updated successfully", projects: user.projects });
  } catch (err) {
    console.error("Error updating projects:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// In your userRoutes.js, make sure these routes are correctly defined:

router.post('/results', async (req, res) => {
  try {
    const { courseId, subIdx, vidIdx, score, totalQuestions, correctAnswers, wrongAnswers, timeSpent } = req.body;
    
    console.log('Received practice result data:', { courseId, subIdx, vidIdx, score, totalQuestions, correctAnswers, wrongAnswers, timeSpent });
    
    // Extract user ID from token like other routes
    const raw = req.headers.authorization || '';
    const token = raw.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, 'secretKey');
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create practice result object
    const practiceResult = {
      courseId,
      subIdx: Number(subIdx),
      vidIdx: Number(vidIdx),
      score: Number(score), // Ensure it's a number
      totalQuestions: Number(totalQuestions),
      correctAnswers: Number(correctAnswers),
      wrongAnswers: Number(wrongAnswers),
      timeSpent: Number(timeSpent),
      completedAt: new Date()
    };

    console.log('Saving practice result:', practiceResult);

    // Add to user's practice history
    if (!user.practiceHistory) {
      user.practiceHistory = [];
    }
    user.practiceHistory.push(practiceResult);
    await user.save();

    console.log('Practice result saved successfully');

    res.json({ success: true, message: 'Practice result saved successfully', result: practiceResult });
  } catch (error) {
    console.error('Error saving practice result:', error);
    res.status(500).json({ error: 'Failed to save practice result', details: error.message });
  }
});

// Get practice history for a user
router.get('/history', async (req, res) => {
  try {
    const raw = req.headers.authorization || '';
    const token = raw.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, 'secretKey');
    const userId = decoded.id;

    const { courseId, subIdx, vidIdx } = req.query;

    const user = await User.findById(userId).select('practiceHistory');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const filteredHistory = user.practiceHistory.filter(attempt =>
      attempt.courseId === courseId &&
      attempt.subIdx === parseInt(subIdx) &&
      attempt.vidIdx === parseInt(vidIdx)
    );

    res.json(filteredHistory);
  } catch (error) {
    console.error('Error fetching practice history:', error);
    res.status(500).json({ error: 'Failed to fetch practice history' });
  }
});

// Add these routes to your backend (in routes/user.js or similar)

// GET /api/user/:userId/streak - Get user's streak data
router.get('/api/user/:userId/streak', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate weekly activity (last 7 days)
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyActivity = [];
    const activities = user.streakData?.dailyActivities || [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasActivity = activities.some(activity => 
        activity.date.toISOString().split('T')[0] === dateStr
      );
      
      if (hasActivity) {
        weeklyActivity.push(dateStr);
      }
    }

    const streakData = {
      currentStreak: user.streakData?.currentStreak || 0,
      longestStreak: user.streakData?.longestStreak || 0,
      lastActivityDate: user.streakData?.lastActivityDate || null,
      weeklyActivity
    };

    res.json(streakData);
  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/:userId/streak - Update user's streak
router.post('/api/user/:userId/streak', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activityType = 'video_watched', courseId, subIdx, vidIdx } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Initialize streak data if it doesn't exist
    if (!user.streakData) {
      user.streakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: null,
        dailyActivities: []
      };
    }

    // Check if user already has activity today
    const todayActivity = user.streakData.dailyActivities.find(
      activity => activity.date.toISOString().split('T')[0] === todayStr
    );

    // Add today's activity
    if (todayActivity) {
      // Add new activity to existing day
      todayActivity.activities.push({
        type: activityType,
        timestamp: today,
        courseId,
        subIdx,
        vidIdx
      });
    } else {
      // Create new day entry
      user.streakData.dailyActivities.push({
        date: today,
        activities: [{
          type: activityType,
          timestamp: today,
          courseId,
          subIdx,
          vidIdx
        }]
      });

      // Update streak logic
      const lastActivityDate = user.streakData.lastActivityDate;
      
      if (!lastActivityDate) {
        // First activity ever
        user.streakData.currentStreak = 1;
        user.streakData.streakStartDate = today;
      } else {
        const lastActivityStr = lastActivityDate.toISOString().split('T')[0];
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivityStr === yesterdayStr) {
          // Consecutive day
          user.streakData.currentStreak += 1;
        } else if (lastActivityStr === todayStr) {
          // Same day, don't increment
        } else {
          // Streak broken, reset
          user.streakData.currentStreak = 1;
          user.streakData.streakStartDate = today;
        }
      }

      // Update longest streak
      if (user.streakData.currentStreak > user.streakData.longestStreak) {
        user.streakData.longestStreak = user.streakData.currentStreak;
      }

      // Update last activity date
      user.streakData.lastActivityDate = today;
    }

    // Clean up old activities (keep only last 90 days)
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    user.streakData.dailyActivities = user.streakData.dailyActivities.filter(
      activity => activity.date >= ninetyDaysAgo
    );

    await user.save();
    
    res.json({ 
      message: 'Streak updated successfully',
      currentStreak: user.streakData.currentStreak,
      longestStreak: user.streakData.longestStreak
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check and update streak (call this when user watches video or completes practice)
const updateUserStreak = async (userId, activityType, courseId, subIdx, vidIdx) => {
  try {
    await fetch(`${API}/api/user/${userId}/streak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        activityType,
        courseId,
        subIdx,
        vidIdx
      })
    });
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};





router.get('/streak', async (req, res) => {
  try {
    const raw = req.headers.authorization || '';
    const token = raw.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, 'secretKey');
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate weekly activity (last 7 days)
    const today = new Date();
    const weeklyActivity = [];
    const activities = user.streakData?.dailyActivities || [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasActivity = activities.some(activity => 
        activity.date.toISOString().split('T')[0] === dateStr &&
        activity.activities && activity.activities.length > 0
      );
      
      weeklyActivity.push({
        date: dateStr,
        hasActivity
      });
    }

    const streakData = {
      currentStreak: user.streakData?.currentStreak || 0,
      longestStreak: user.streakData?.longestStreak || 0,
      lastActivityDate: user.streakData?.lastActivityDate || null,
      weeklyActivity
    };

    res.json(streakData);
  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/streak - Update user's streak
router.post('/streak', async (req, res) => {
  try {
    const raw = req.headers.authorization || '';
    const token = raw.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, 'secretKey');
    const userId = decoded.id;

    const { activityType = 'video_watched', courseId, subIdx, vidIdx } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Initialize streak data if it doesn't exist
    if (!user.streakData) {
      user.streakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: null,
        dailyActivities: []
      };
    }

    // Check if user already has activity today
    let todayActivity = user.streakData.dailyActivities.find(
      activity => activity.date.toISOString().split('T')[0] === todayStr
    );

    const newActivity = {
      type: activityType,
      timestamp: today,
      courseId,
      subIdx,
      vidIdx
    };

    let isNewDay = false;

    // Add today's activity
    if (todayActivity) {
      // Add new activity to existing day
      todayActivity.activities.push(newActivity);
    } else {
      // Create new day entry
      isNewDay = true;
      todayActivity = {
        date: today,
        activities: [newActivity]
      };
      user.streakData.dailyActivities.push(todayActivity);

      // Update streak logic only when it's a new day
      const lastActivityDate = user.streakData.lastActivityDate;
      
      if (!lastActivityDate) {
        // First activity ever
        user.streakData.currentStreak = 1;
        user.streakData.streakStartDate = today;
      } else {
        const lastActivityStr = lastActivityDate.toISOString().split('T')[0];
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivityStr === yesterdayStr) {
          // Consecutive day
          user.streakData.currentStreak += 1;
        } else {
          // Streak broken, reset
          user.streakData.currentStreak = 1;
          user.streakData.streakStartDate = today;
        }
      }

      // Update longest streak
      if (user.streakData.currentStreak > user.streakData.longestStreak) {
        user.streakData.longestStreak = user.streakData.currentStreak;
      }

      // Update last activity date
      user.streakData.lastActivityDate = today;
    }

    // Clean up old activities (keep only last 90 days)
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    user.streakData.dailyActivities = user.streakData.dailyActivities.filter(
      activity => activity.date >= ninetyDaysAgo
    );

    await user.save();
    
    res.json({ 
      message: 'Streak updated successfully',
      currentStreak: user.streakData.currentStreak,
      longestStreak: user.streakData.longestStreak,
      isNewDay
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// routes/userRoutes.js
router.put("/user/:id/courseCompletion", async (req, res) => {
  try {
    const { courseCompletion } = req.body;

    if (typeof courseCompletion !== "number" || courseCompletion < 0 || courseCompletion > 100) {
      return res.status(400).json({ error: "Invalid course completion value" });
    }

    await User.findByIdAndUpdate(
      req.params.id,
      { courseCompletion },
      { new: true }
    );

    res.json({ success: true, message: "Course completion updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// backend/routes/userRoutes.js
router.post('/save-question', async (req, res) => {
  try {
    const raw = req.headers.authorization || '';
    const token = raw.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, 'secretKey');
    const { question, correctOption, options } = req.body;

    // Get the full answer text from the options
    const correctAnswerText = options[correctOption];

    await User.findByIdAndUpdate(
      decoded.id,
      { $push: { savedQuestions: { question, correctAnswer: correctAnswerText } }},
      { new: true }
    );

    res.json({ success: true, message: 'Question saved successfully' });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ error: 'Failed to save question' });
  }
});

// GET saved questions
router.get('/:id/saved-questions', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user.savedQuestions || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});








export default router;





