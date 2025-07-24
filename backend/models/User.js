// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    /* ─── Basic profile ─────────────────────────────── */
    name:     { type: String,  required: true },
    email:    { type: String,  required: true, unique: true },
    password: { type: String,  required: true },
    phone:    { type: String },

      firstName: { type: String },
  lastName: { type: String },
  ircName: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer Not to Say'] },
  communicationLanguage: { type: String },
  teachingLanguage: { type: String },
  dateOfBirth: { type: Date },
  linkedIn: { type: String },
  twitter: { type: String },
  github: { type: String },
  photoURL: { type: String }, // store image URL or base64 string
  resumeURL: { type: String },

  
  isWhatsAppSame: { type: String, enum: ["Yes", "No", "Don't have WhatsApp"], default: "Yes" },
  


    /* ─── Role & account state ──────────────────────── */
    role:   { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
    alertAvailable: {
  type: Boolean,
  default: false
},parentGuardian: {
  firstName: { type: String },
  lastName: { type: String },
  relation: { type: String },
  occupation: { type: String },
  email: { type: String },
  phone: { type: String },
  isWhatsAppSame: {
    type: String,
    enum: ["Yes", "No", "Don't have WhatsApp"],
    default: "Yes"
  }
},currentAddress: {
  addressLine1: { type: String },
  addressLine2: { type: String },
  city: { type: String },
  state: { type: String },
  pinCode: { type: String },
  country: { type: String },
},currentExpertise: {
  codingLevel: { type: String },
  hasLaptop: { type: String },
  knownSkills: { type: [String], default: [] },
  otherSkills: { type: String }
},yourPreference: {
  jobSearchStatus: {
    type: String,
    enum: ["Actively looking", "Passively looking", "Not looking"],
  },
  expectedCTC: {
    type: String,
    enum: [
      "<3 Lakh Per Annum",
      "3 - 4.5 Lakh Per Annum",
      "4.5 - 6 Lakh Per Annum",
      "6 - 9 Lakh Per Annum",
      "9 - 18 Lakh Per Annum",
      ">18 Lakh Per Annum"
    ],
  },
},tenthStandard: {
    tenthBoard: { type: String },
    schoolName: { type: String },
    markingScheme: {
      type: String,
      enum: ["Grade/CGPA", "Percentage"]
    },
    cgpa: { type: Number },
    percentage: { type: Number }
  },


    /* ─── Course enrollment & payments ──────────────── */
    course:      { type: String,  default: '' }, 
    geminiApiKey: {
  type: String,
  default: null,
},  // course title or ID
    courseFee:   { type: Number,  default: 0 },
    amountPaid:  { type: Number,  default: 0 },
    paymentMode: { type: String },
    notes:       { type: String },lastSeenResolvedTicketId: { type: String, default: null },
    watchedVideos: { type: [String], default: [] },
    ticketIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
