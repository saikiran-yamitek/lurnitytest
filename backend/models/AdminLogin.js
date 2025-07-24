import mongoose from 'mongoose';

const adminLoginSchema = new mongoose.Schema({
  username: String,
  password: String
});

export default mongoose.model('AdminLogin', adminLoginSchema);
