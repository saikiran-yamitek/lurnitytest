// backend/routes/admin.js

import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction.js';
import { convertToCSV } from '../utils/csvExport.js';
import { generateReceiptStream } from '../utils/pdfReceipt.js';
import PDFDocument from 'pdfkit';
import Ticket from '../models/Ticket.js';

const router = express.Router();

// 🟢 List Users
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 🟢 Update User
router.put('/users/:id', async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// 🟢 Delete User
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 🟢 Export CSV
router.get('/users/export/csv', async (req, res) => {
  const users = await User.find();
  const csv = convertToCSV(users);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
  res.send(csv);
});

// 🟢 Log Transaction
router.post('/users/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, mode, date } = req.body;

    const txn = await Transaction.create({ userId: id, amount, mode, date });

    const user = await User.findById(id);
    user.amountPaid = Number(user.amountPaid || 0) + Number(amount);
    await user.save();

    res.json(txn);
  } catch (err) {
    res.status(500).json({ error: 'Transaction logging failed', details: err.message });
  }
});

// 🟢 Get Transactions for a User
router.get('/users/:id/transactions', async (req, res) => {
  const txns = await Transaction.find({ userId: req.params.id }).sort({ date: -1 });
  res.json(txns);
});

// 🟢 Generate PDF Receipt
// Generate PDF Receipt


router.get('/users/:id/receipt', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    /* ---------- create doc ---------- */
    const doc = new PDFDocument({ margin: 50 });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt_${user._id}.pdf"`
    });
    doc.pipe(res);

    /* ---------- optional logo ---------- */
    try {
      const logoPath = path.resolve('assets', 'LURNITY.jpg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 100 });
      }
    } catch (e) {
      console.warn('Logo not loaded:', e.message);
    }

    /* ---------- optional custom font ---------- */
    try {
      const robotoPath = path.resolve('assets', 'fonts', 'Roboto-Regular.ttf');
      if (fs.existsSync(robotoPath)) {
        doc.registerFont('Roboto', robotoPath);
        doc.font('Roboto');
      }
    } catch (e) {
      console.warn('Custom font missing, falling back to Helvetica.');
    }

    /* ---------- header ---------- */
    doc
      .fontSize(22).fillColor('#202c54')
      .text('Lurnity LMS', { align: 'center' })
      .moveDown(0.3)
      .fontSize(14).fillColor('#000')
      .text('Payment Receipt', { align: 'center' })
      .moveDown(1.5);

    /* ---------- user details ---------- */
    const safe = v => v ?? '—';
    const fee  = Number(user.courseFee)   || 0;
    const paid = Number(user.amountPaid)  || 0;
    const bal  = fee - paid;

    doc.fontSize(12);
    doc.text(`Name          :  ${safe(user.name)}`);
    doc.text(`Email         :  ${safe(user.email)}`);
    doc.text(`Course        :  ${safe(user.course)}`);
    doc.moveDown(0.7);

    /* ---------- fee table ---------- */
    doc.fontSize(12);
    doc.text(`Course Fee    :  ₹${fee}`);
    doc.text(`Amount Paid   :  ₹${paid}`);
    doc.text(`Balance       :  ₹${bal}`);
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cccccc');
    doc.moveDown(1);

    /* ---------- footer ---------- */
    doc.fontSize(10).fillColor('#555');
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown(1);
    doc.text('Thank you for choosing Lurnity LMS.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Receipt generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate receipt' });
    }
  }
});




// 🟢 List Courses
router.get('/courses', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// 🟢 Create Course
router.post('/courses', async (req, res) => {
  const course = await Course.create(req.body);
  res.json(course);
});

// 🟢 Update Course
router.put('/courses/:id', async (req, res) => {
  const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// 🟢 Delete Course
router.delete('/courses/:id', async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 🟢 Dashboard Stats (optional)
router.get('/stats', async (req, res) => {
  const userCount = await User.countDocuments();
  const courseCount = await Course.countDocuments();
  const totalRevenue = await User.aggregate([
    { $group: { _id: null, total: { $sum: "$amountPaid" } } }
  ]);
  res.json({ userCount, courseCount, totalRevenue: totalRevenue[0]?.total || 0 });
});

// routes/admin.js or similar
router.delete('/tickets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Ticket.findByIdAndDelete(id);
    res.sendStatus(204); // No Content
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

router.patch("/users/:id/lock", async (req, res) => {
  try {
    const { lockStatus } = req.body; // "locked" or "unlocked"
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profileLock: lockStatus },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





export default router;
