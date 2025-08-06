// models/Placement.js
import mongoose from "mongoose";

const PlacementSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  company: String,
  role: String,
  location: String,
  date: Date,
  seats: Number,
  createdBy: String,
  ctc: String,
  serviceAgreement: String,
  lastDateToApply: Date,
  driveDate: Date,
  eligibilityCriteria: String,
  note: String,
  jobLocation: String,
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED'],
    default: 'SCHEDULED',
  },
  skillsRequired: String,
  // Optional: Keep these if you want to allow manual override
  aboutCompany: String,
  companyWebsite: String,
  companyLinkedin: String,
  registered: [
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['PLACED', 'NOT PLACED', 'PENDING'], default: 'PENDING' },
    remarks: { type: String, default: "" },
    offerLetterURL: { type: String, default: "" }
  }
]

});

export default mongoose.model('Placement', PlacementSchema);
