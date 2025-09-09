import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  resumeUrl: { type: String, required: true }, // Google Drive link with open access
  appliedAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  department: {
    type: String,
    enum: ['Engineering', 'Content', 'Design', 'Business', 'Marketing'],
    required: true
  },
  roleName: { type: String, required: true },
  location: { type: String, required: true },
  type: {
    type: String,
    enum: ['Full-time', 'Hybrid', 'Internship'],
    required: true
  },
  experience: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], required: true },
  isActive: { type: Boolean, default: true },
   applications: [applicationSchema], 
  createdAt: { type: Date, default: Date.now }
});

const cohortSchema = new mongoose.Schema({
  title: String,
  startDate: Date,
  duration: String,
  seatsLeft: Number,
  badgeType: String,
  isActive: Boolean,
  tagline: String,
  speakerName: String,
  speakerCompany: String,
  rating: Number,
  whatYouWillLearn: [String]
});


const landingPageSchema = new mongoose.Schema({
  cohorts: [cohortSchema],
  jobs: [jobSchema],
  lastUpdated: { type: Date, default: Date.now }
});

const LandingPage = mongoose.model('LandingPage', landingPageSchema);
export default LandingPage;
