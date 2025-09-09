import mongoose from "mongoose";

const demoSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  education: String,
  currentEducation: String,
  city: String,
  collegeAddress: String,
  college: String,
  state:String,
  booked: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Demo", demoSchema);