// models/Company.js
import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  about: String,
  website: String,
  linkedin: String
});

export default mongoose.model('Company', CompanySchema);
