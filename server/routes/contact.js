import express from 'express';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';
import Contact from '../models/Contact.js';
import { sendContactEmail } from '../utils/sendEmail.js';

dotenv.config();

const router = express.Router();

// --- Rate Limiting: 100 requests per 15 minutes ---
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact attempts from this IP. Please try again later.',
  },
});

// --- Health Check Route ---
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Contact route is operational',
    timestamp: new Date().toISOString(),
  });
});

// --- Contact Submission Route ---
router.post(
  '/',
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters.')
      .escape(),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address.')
      .normalizeEmail(),

    body('message')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, email, message } = req.body;

    // Sanitize inputs to prevent XSS
    const sanitizedName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
    const sanitizedMessage = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

    if (!sanitizedName || !email || !sanitizedMessage) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    try {
      // Save to DB
      const newContact = new Contact({
        name: sanitizedName,
        email,
        message: sanitizedMessage,
      });

      await newContact.save();

      // Send email notification (non-blocking)
      sendContactEmail({
        name: sanitizedName,
        email,
        message: sanitizedMessage,
      }).catch((emailErr) => {
        console.error('❌ Failed to send contact email:', emailErr);
      });

      return res.status(200).json({
        success: true,
        message: 'Message received successfully!',
        data: {
          id: newContact._id,
          timestamp: newContact.createdAt,
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Contact submission error:', {
          error: error.message,
          stack: error.stack,
          body: req.body,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.error('Contact submission error:', error.message);
      }

      return res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

export default router;
