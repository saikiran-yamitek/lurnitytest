import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  mode: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', transactionSchema);
