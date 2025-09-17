import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'lms' });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
