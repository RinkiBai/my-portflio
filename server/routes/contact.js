import express from 'express';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import Contact from '../models/Contact.js';
import { sendContactEmail } from '../utils/sendEmail.js';
import sanitizeHtml from 'sanitize-html';

dotenv.config();

const router = express.Router();

// Rate limiting (100 requests per 15 minutes)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many contact attempts from this IP, please try again later'
});

// Health check
router.get('/', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'Contact route is working!',
    timestamp: new Date().toISOString()
  });
});

// Submit contact form
router.post(
  '/',
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2-50 characters')
      .escape(),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('message')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message must be between 10-1000 characters')
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);

    // Log received data
    console.log('Contact form received:', req.body);

    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        message: 'Validation failed'
      });
    }

    // Sanitize HTML content
    const { name, email, message } = req.body;
    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {}
    });

    try {
      // Save to database
      const newContact = new Contact({ 
        name: sanitizeHtml(name),
        email,
        message: sanitizedMessage
      });
      await newContact.save();

      // Send email (non-blocking)
      sendContactEmail({ name, email, message: sanitizedMessage })
        .catch(emailError => {
          console.error('Email sending failed:', emailError);
          // Don't fail the request if email fails
        });

      res.status(200).json({ 
        success: true, 
        message: 'Message received successfully!',
        data: {
          id: newContact._id,
          timestamp: newContact.createdAt
        }
      });

    } catch (error) {
      console.error('Contact submission error:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        timestamp: new Date().toISOString()
      });

      res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again later.',
        error: process.env.NODE_ENV === 'development' 
          ? error.message 
          : undefined
      });
    }
  }
);

export default router;
