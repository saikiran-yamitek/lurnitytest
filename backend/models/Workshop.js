import mongoose from "mongoose";

const workshopSchema = new mongoose.Schema({
  labName: { type: String, required: true },
  labAddress: { type: String, required: true },
  time: { type: Date, required: true },
  memberCount: { type: Number, required: true },
  // models/Workshop.js
registeredStudents: [{
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  registeredAt: { type: Date, default: Date.now },
  attendance: { type: Boolean, default: false },
  result: { type: String, enum: ['pending', 'pass', 'fail'], default: 'pending' }
}],

  inchargeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }
}, { timestamps: true });

export default mongoose.model("Workshop", workshopSchema);
