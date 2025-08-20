/********************** server.js (ESM) ************************/
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { TextEncoder, TextDecoder } from 'util';
import http from 'http';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminAuthRoutes from './routes/adminAuth.js';
import adminRoutes from './routes/admin.js';
import courseRoutes from './routes/courses.js';
import progressRoutes from "./routes/progress.js";
import codeKeyRoutes from "./routes/codeKey.js";
import empRoutes from "./routes/employees.js";
import ticketRoutes from "./routes/tickets.js";
import empAuthRoutes from "./routes/empAuth.js";
import transcribeRoutes from './routes/transcribe.js';
import certificateRoutes from './routes/certificates.js';
import geminiRoutes from './routes/gemini.js';
import demoRoutes from './routes/demo.js';
import workshopRoutes from "./routes/workshop.js";
import placementRoutes from './routes/placementRoutes.js';
import companyRoutes from './routes/companies.js';
import feedbackRoutes from './routes/feedback.js';
import rankingsRoutes from "./routes/rankings.js";
import adminlandingPageRoutes from './routes/adminLandingPage.js'
import landingPageRoutes from './routes/landingPageRoutes.js';



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

/* API Routes */
app.use("/api/progress", progressRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/admin/employees", empRoutes);
app.use("/api/employees", empRoutes);
app.use("/api/key", codeKeyRoutes);
app.use("/api/admin/tickets", ticketRoutes);
app.use("/api/tickets", ticketRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/employees", empAuthRoutes);
app.use('/api/admin/transcribe', transcribeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/gemini', geminiRoutes); 
app.use('/api/demo', demoRoutes); 
app.use("/api/workshops", workshopRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/rankings", rankingsRoutes);
app.use('/api/admin/landingpage', adminlandingPageRoutes);
app.use('/api/landingpage', landingPageRoutes);
app.use('/api', landingPageRoutes);



/* HTTP + Socket.IO Server */
const server = http.createServer(app);

             // ✅ Attach io to app for access in routes

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 7700;
    server.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
}

start();
