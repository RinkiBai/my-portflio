import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { htmlToText } from 'html-to-text';
import sanitizeHtml from 'sanitize-html';

dotenv.config();

// Validate environment variables
const validateEnvVars = () => {
  const required = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_RECEIVER'];
  const missing = required.filter(v => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
};

// Enhanced transporter configuration
const createTransporter = () => {
  validateEnvVars();

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    tls: {
      minVersion: 'TLSv1.2',
      ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
    },
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production'
  });
};

const transporter = createTransporter();

// Verify connection on startup
transporter.verify()
  .then(() => console.log('SMTP connection verified'))
  .catch(err => console.error('SMTP verification failed:', err));

/**
 * Enhanced email sending with retries
 */
export const sendContactEmail = async ({ name, email, message }, retries = 3) => {
  const sanitized = {
    name: sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} }),
    message: sanitizeHtml(message, {
      allowedTags: ['br', 'p', 'strong', 'em', 'a'],
      allowedAttributes: { a: ['href', 'target'] }
    })
  };

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_RECEIVER,
    replyTo: email,
    subject: `New contact from ${sanitized.name}`,
    text: htmlToText(`
      From: ${sanitized.name} <${email}>
      Message: ${sanitized.message}
    `),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 0.5rem;">
          <p><strong>From:</strong> ${sanitized.name} &lt;${email}&gt;</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <div style="margin: 1rem 0; padding: 1rem; background: white; border-radius: 0.25rem;">
            ${sanitized.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">
          Sent via portfolio contact form
        </p>
      </div>
    `,
    envelope: {
      from: `noreply@${process.env.EMAIL_USER.split('@')[1] || 'yourdomain.com'}`,
      to: process.env.EMAIL_RECEIVER
    }
  };

  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent (attempt ${i + 1}):`, info.messageId);
      return info;
    } catch (error) {
      if (i === retries - 1) {
        console.error('Final email send failure:', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          recipient: process.env.EMAIL_RECEIVER
        });
        throw new Error('Failed to send email after multiple attempts');
      }
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};