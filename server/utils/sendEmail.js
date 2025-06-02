import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { htmlToText } from 'html-to-text';
import sanitizeHtml from 'sanitize-html';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_RECEIVER'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // use connection pooling
  maxConnections: 5, // maximum concurrent connections
  maxMessages: 100, // maximum messages per connection
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server connection established');
  }
});

/**
 * Send contact form email with proper sanitization and error handling
 * @param {Object} params - Email parameters
 * @param {string} params.name - Sender's name
 * @param {string} params.email - Sender's email
 * @param {string} params.message - Message content
 * @returns {Promise<void>}
 */
export const sendContactEmail = async ({ name, email, message }) => {
  // Sanitize HTML content
  const sanitizedMessage = sanitizeHtml(message, {
    allowedTags: ['br', 'p', 'strong', 'em', 'a'],
    allowedAttributes: {
      a: ['href', 'target']
    }
  });

  const sanitizedName = sanitizeHtml(name, {
    allowedTags: [],
    allowedAttributes: {}
  });

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_RECEIVER,
    replyTo: email, // Allows direct reply to sender
    subject: `New message from ${sanitizedName} via Portfolio Contact Form`,
    text: htmlToText(`
      <p>You received a new message from <strong>${sanitizedName}</strong> (${email}):</p>
      <p>${sanitizedMessage}</p>
      <p>---</p>
      <p>This message was sent via your portfolio contact form.</p>
    `),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">New Portfolio Contact</h2>
        <p><strong>From:</strong> ${sanitizedName} &lt;${email}&gt;</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          ${sanitizedMessage.replace(/\n/g, '<br>')}
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #777; font-size: 0.9em;">
          This message was sent via your portfolio contact form.
          <br>You can reply directly to ${email}.
        </p>
      </div>
    `,
    envelope: {
      from: `contact-form@yourdomain.com`, // Different from address for DMARC compliance
      to: process.env.EMAIL_RECEIVER
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw new Error('Failed to send email. Please try again later.');
  }
};