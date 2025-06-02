import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import projectRoutes from './routes/projects.js';
import contactRoutes from './routes/contact.js';

// Initialize environment variables
dotenv.config();

const app = express();

// Allowed origins array
const allowedOrigins = [
  'https://portfolio-mern-xi.vercel.app',
  'https://portfolio-mern-boij.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL
];

// Regex to match all Vercel preview deployments like portfolio-mern-xxxx.vercel.app
const vercelPreviewRegex = /^https:\/\/portfolio-mern-[a-z0-9-]+\.vercel\.app$/;

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) {
      // Allow requests with no origin (like curl or Postman)
      return callback(null, true);
    }
    if (
      allowedOrigins.includes(origin) || 
      vercelPreviewRegex.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicit preflight handling
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get(['/', '/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    server: 'portfolio-mern-backend',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Server startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
