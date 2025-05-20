import express from 'express';
import dotenv from 'dotenv';
import Contact from '../models/Contact.js';
import { sendContactEmail } from '../utils/sendEmail.js';

dotenv.config();

const router = express.Router();

// Health check route
router.get('/', (req, res) => {
  res.json({ message: 'Contact route is reachable!' });
});

// Submit contact form (no captcha)
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  try {
    // Save contact message to DB
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Send notification email
    await sendContactEmail({ name, email, message });

    res.status(200).json({ success: true, message: 'Message received and email sent!' });
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Admin View: Get all contact messages
router.get('/all', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts.' });
  }
});

// Delete a contact message by ID (Admin Action)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }

    res.status(200).json({ success: true, message: 'Contact message deleted.' });
  } catch (error) {
    console.error('Error deleting contact:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete contact.' });
  }
});

export default router;
