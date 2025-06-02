import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import projectRoutes from './routes/projects.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();

// --- Allowed Origins ---
const allowedOrigins = [
  'https://portfolio-mern-xi.vercel.app',
  'https://portfolio-mern-boij.onrender.com',
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
];

// Allow all preview deployments on Vercel (e.g., https://portfolio-mern-abc123.vercel.app)
const vercelPreviewRegex = /^https:\/\/portfolio-mern.*\.vercel\.app$/;

// --- CORS Configuration ---
const corsOptions = {
  origin: (origin, callback) => {
    console.log('🌐 Request Origin:', origin);
    if (!origin || allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked CORS origin: ${origin}`);
      callback(new Error(`CORS error: Origin ${origin} is not allowed.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight support

// --- Middleware ---
app.use(express.json({ limit: '1mb' }));

// --- Routes ---
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);

// --- Health Check Route ---
app.get(['/', '/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    server: 'portfolio-mern-backend',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
  });
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority',
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// --- Unhandled Rejections ---
process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
