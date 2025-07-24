// backend/models/Course.js
import mongoose from 'mongoose';

/* ---------- nested schemas ---------- */
const VideoSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  url:      { type: String, required: true },
  duration: { type: Number, required: true } ,
  transcript: String     // minutes
});

const SubCourseSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  duration: { type: Number, required: true },
  lab:      { type: String, enum: ['Yes', 'No'], default: 'No' },    // minutes (summary of its videos)
  videos:   { type: [VideoSchema], default: [] }
});

/* ---------- top‑level course ---------- */
const CourseSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  instructor:      { type: String },
  overallDuration: { type: Number, required: true },  // minutes for entire course
  status:          { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  subCourses:      { type: [SubCourseSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('Course', CourseSchema);
