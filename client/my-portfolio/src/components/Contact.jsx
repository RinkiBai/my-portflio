import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const SITE_KEY = '6LdBnD8rAAAAANG7yttopYWSCHaBOEKJnDb8lKxd'; // v3 site key

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = () =>
    formData.name.trim() !== '' &&
    validateEmail(formData.email) &&
    formData.message.trim() !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isFormValid()) {
      setErrorMessage('❌ Please fill all fields correctly.');
      return;
    }

    if (!executeRecaptcha) {
      setErrorMessage('❌ reCAPTCHA not yet available. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const token = await executeRecaptcha('contact_form');

      const { data } = await axios.post('https://portfolio-mern-boij.onrender.com/api/contact', {
        ...formData,
        token,
      });

      if (data.success) {
        setSuccessMessage('✅ Your message has been sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setErrorMessage(data.message || '❌ Failed to send message.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('❌ Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const inputStyle = {
    padding: '1rem',
    margin: '0.5rem 0',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '150px',
    resize: 'horizontal',
  };

  const messageStyle = {
    marginTop: '1rem',
    fontWeight: 'bold',
    animation: 'fadeInOut 6s ease-in-out forwards',
  };

  return (
    <section
      style={{
        padding: '4rem 2rem',
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
      }}
    >
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>

      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#333' }}>
        Contact Me
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
        }}
        noValidate
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
          disabled={loading}
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
          disabled={loading}
        />

        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
          maxLength={500}
          style={textareaStyle}
          disabled={loading}
        />

        <small
          style={{
            color: '#666',
            fontSize: '0.85rem',
            alignSelf: 'flex-start',
            width: '100%',
            maxWidth: '600px',
          }}
        >
          {formData.message.length}/500 characters
        </small>

        <button
          type="submit"
          disabled={loading || !isFormValid()}
          style={{
            padding: '1rem 2rem',
            backgroundColor: loading || !isFormValid() ? '#7baedc' : '#0077b5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !isFormValid() ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'background-color 0.3s',
            marginTop: '1rem',
            width: '100%',
            maxWidth: '600px',
          }}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>

        {(successMessage || errorMessage) && (
          <div
            style={{
              ...messageStyle,
              color: successMessage ? 'green' : 'red',
              width: '100%',
              maxWidth: '600px',
            }}
            role="alert"
          >
            {successMessage || errorMessage}
          </div>
        )}
      </form>
    </section>
  );
};

// Wrap ContactForm with reCAPTCHA provider
const Contact = () => (
  <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
    <ContactForm />
  </GoogleReCaptchaProvider>
);

export default Contact;
