import React from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Validation schema with Zod
const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

const Contact = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  // Read backend base URL from environment variable with fallback
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://portfolio-mern-boij.onrender.com';

  const onSubmit = async (data) => {
    try {
      console.log('Sending contact data:', data);

      const response = await axios.post(
        `${backendUrl}/api/contact`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Only if your backend needs cookies/session
        }
      );

      if (response.data.success) {
        toast.success('✅ Your message has been sent successfully!');
        reset();
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Submission error:', error);

      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationMessages = error.response.data.errors
          .map((err) => err.msg || err.message)
          .join(', ');
        toast.error(`Validation errors: ${validationMessages}`);
      } else {
        toast.error(
          error?.response?.data?.message || error?.message || '❌ Failed to send message. Please try again.'
        );
      }
    }
  };

  return (
    <section className="contact-section" aria-label="Contact form section">
      <h2>Contact Me</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <input
            {...register('name')}
            type="text"
            placeholder="Your Name"
            aria-invalid={errors.name ? 'true' : 'false'}
            className={errors.name ? 'input-error' : ''}
            autoComplete="name"
          />
          {errors.name && (
            <p className="error-message" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <input
            {...register('email')}
            type="email"
            placeholder="Your Email"
            aria-invalid={errors.email ? 'true' : 'false'}
            className={errors.email ? 'input-error' : ''}
            autoComplete="email"
          />
          {errors.email && (
            <p className="error-message" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <textarea
            {...register('message')}
            placeholder="Your Message"
            rows={5}
            aria-invalid={errors.message ? 'true' : 'false'}
            className={errors.message ? 'input-error' : ''}
          />
          {errors.message && (
            <p className="error-message" role="alert">
              {errors.message.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </form>

      <style jsx>{`
        .contact-section {
          padding: 4rem 2rem;
          background-color: #f5f5f5;
          text-align: center;
        }

        h2 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #333;
        }

        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .form-group {
          width: 100%;
          margin-bottom: 1rem;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.75rem;
          border-radius: 5px;
          border: 1px solid #ccc;
          font-size: 1rem;
          transition: border 0.3s ease;
          font-family: inherit;
        }

        .input-error {
          border-color: #ff4444 !important;
        }

        textarea {
          resize: vertical;
          min-height: 120px;
        }

        button {
          background-color: ${isSubmitting ? '#888' : '#007BFF'};
          color: #fff;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 5px;
          cursor: ${isSubmitting ? 'not-allowed' : 'pointer'};
          font-size: 1rem;
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .error-message {
          color: #ff4444;
          margin-top: 0.25rem;
          text-align: left;
          font-size: 0.875rem;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
