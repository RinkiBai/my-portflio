import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import projectRoutes from './routes/projects.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();

// ✅ Allowed origins (local + Vercel frontend)
const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://portfolio-mern-gct8.vercel.app' // deployed Vercel frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
