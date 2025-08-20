import mongoose from 'mongoose';


const FeedbackSchema = new mongoose.Schema({
  userId:     { type: String,ref: 'User', required: true },
  courseId:   { type: String, required: true },
  subIndex:   { type: Number, required: true },
  videoIndex: { type: Number, required: true },
  rating:     { type: Number, min: 1, max: 5, required: true },
  comment:    { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Feedback', FeedbackSchema);