import express from 'express';
import dotenv from 'dotenv';
import Contact from '../models/Contact.js';
import { sendContactEmail } from '../utils/sendEmail.js';

dotenv.config();

const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.json({ message: 'Contact route is working!' });
});

// Submit contact form
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required.' 
    });
  }

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    console.log('Saving contact successful');

    await sendContactEmail({ name, email, message });

    console.log('Email sent successfully');

    res.status(200).json({ 
      success: true, 
      message: 'Message received!' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error. Please try again later.' 
    });
  }
});

export default router;
