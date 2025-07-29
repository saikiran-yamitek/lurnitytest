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
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer Not to Say'] },
  communicationLanguage: { type: String },
  teachingLanguage: { type: String },
  dateOfBirth: { type: Date },
  linkedIn: { type: String },
  twitter: { type: String },
  github: { type: String },
  photoURL: { type: String }, // store image URL or base64 string
  resumeURL: { type: String },
  projects: [
  {
    title: String,
    points: [String],
  }
],

  
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
  },intermediateOrDiploma: {
  stream: {
    type: String,
    enum: ["Intermediate/12th", "Diploma", "ITI", "Others"]
  },
  status: {
    type: String,
    enum: [
      "Completed Successfully",
      "Currently Studying",
      "Having Backlogs, will clear them soon"
    ]
  },
  institutionName: { type: String },
  markingScheme: {
    type: String,
    enum: ["Grade/CGPA", "Percentage"]
  },
  cgpa: { type: Number },
  percentage: { type: Number },
  yearOfCompletion: { type: Date }
},bachelorsDegree: {
  degreeName: {
    type: String,
    enum: [
      "B Tech (Bachelor of Technology)",
      "BE (Bachelor of Engineering)",
      "BSc (Bachelor of Science)",
      "B Com (Bachelor of Commerce)",
      "BBA (Bachelor of Business Administration)",
      "BA (Bachelor of Arts)",
      "BCA (Bachelor of Computer Applications)",
      "B Pharm (Bachelor of Pharmacy)",
      "BHM (Bachelor of Hotel Management)",
      "BHMCT (Bachelor of Hotel Management & Catering Technology)",
      "MBBS (Bachelor of Medicine and a Bachelor of Surgery)",
      "B Arch (Bachelor of Architecture)",
      "B Des (Bachelor of Design)",
      "BF Tech (Bachelor of Fashion Technology)",
      "BVC (Bachelor of Visual Communication)",
      "Plan (Bachelor of Planning)",
      "BFSc (Bachelor of Fishery Science)",
      "BPEd (Bachelor of Physical Education)",
      "B Voc (Bachelor of Vocation)",
      "BBI (Bachelor of Banking and Insurance)",
      "BBM (Bachelor of Business Management)",
      "BFM (Bachelor of Financial Markets)",
      "BMS (Bachelor of Management Studies)",
      "B Text (Bachelor of Textile)",
      "BFA (Bachelor of Fine Arts)",
      "BASLP (Bachelor of Audiology & Speech Language Pathology)",
      "BMLT (Bachelor of Medical Laboratory Technology)",
      "BNYS (Bachelor of Naturopathy and Yogic Sciences)",
      "BOPTM (Bachelor of Optometry)",
      "BOT (Bachelors of Occupational Therapy)",
      "BPMT (Bachelor of Paramedical Technology)",
      "BVSc (Bachelor of Veterinary Science)",
      "Others"
    ]
  },
  status: {
    type: String,
    enum: [
      "Completed Successfully",
      "Currently Studying",
      "Having Backlogs, will clear them soon",
      "Discontinued Degree"
    ]
  },
  department: { type: String },
  markingScheme: {
    type: String,
    enum: ["Grade/CGPA", "Percentage"]
  },
  cgpa: { type: Number },
  percentage: { type: Number },
  startYear: { type: Date },
  endYear: { type: Date },
  instituteCountry: { type: String },
  instituteName: { type: String },
  institutePincode: { type: String },
  instituteState: { type: String },
  instituteDistrict: { type: String },
  instituteCity: { type: String }
},completedSubcourses: {
  type: [String],
  default: []
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
