import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import sanitizeHtml from 'sanitize-html';
import Contact from '../models/Contact.js';
import { sendContactEmail } from '../utils/sendEmail.js';

dotenv.config();

const router = express.Router();

// Middleware
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many contact attempts from this IP, please try again later'
});

const adminAuth = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized' 
    });
  }
  next();
};

router.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'DELETE']
}));

// Routes
router.get('/', (req, res) => {
  res.json({ message: 'Contact route is reachable!' });
});

router.post('/', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required.' 
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email address.' 
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({ 
      success: false, 
      message: 'Message too long (max 1000 characters)' 
    });
  }

  try {
    const cleanMessage = sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {}
    });

    const newContact = new Contact({ 
      name: name.trim(), 
      email: email.trim(), 
      message: cleanMessage 
    });
    
    await newContact.save();
    await sendContactEmail({ name, email, message: cleanMessage });

    res.status(200).json({ 
      success: true, 
      message: 'Message received and email sent!' 
    });
  } catch (error) {
    console.error(`Contact Form Error: ${error.message}`, {
      endpoint: req.originalUrl,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const count = await Contact.countDocuments();
    
    res.status(200).json({
      success: true,
      data: contacts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching contacts:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contacts.' 
    });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Contact message deleted.' 
    });
  } catch (error) {
    console.error('Error deleting contact:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete contact.' 
    });
  }
});

export default router;