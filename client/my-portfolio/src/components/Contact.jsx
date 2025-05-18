import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);

  const SITE_KEY = '6LdryD4rAAAAAAGQ6oIXgv5RsbusoUOJABDGiNvu'; // Your actual site key

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = () =>
    formData.name.trim() !== '' &&
    validateEmail(formData.email) &&
    formData.message.trim() !== '' &&
    captchaToken;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isFormValid()) {
      setErrorMessage('❌ Please fill all fields correctly and complete reCAPTCHA.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post('https://portfolio-mern-boij.onrender.com/api/contact', {
        ...formData,
        token: captchaToken,
      });

      if (data.success) {
        setSuccessMessage('✅ Your message has been sent successfully!');
        setFormData({ name: '', email: '', message: '' });
        setCaptchaToken(null);
        if (captchaRef.current) {
          captchaRef.current.reset();
        }
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

        <div style={{ marginTop: '1rem' }}>
          <ReCAPTCHA
            sitekey={SITE_KEY}
            onChange={handleCaptchaChange}
            onExpired={() => setCaptchaToken(null)}
            ref={captchaRef}
          />
        </div>

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

export default Contact;
