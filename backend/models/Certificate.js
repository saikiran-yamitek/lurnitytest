import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Course'
  },
  subCourseTitle: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  certificateUrl: {
    type: String,
    default: "" // Optional: URL to a generated PDF if implemented
  }
});

certificateSchema.index({ userId: 1, courseId: 1, subCourseTitle: 1 }, { unique: true });

export default mongoose.model('Certificate', certificateSchema);
