import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Contact from '../../../../server/models/Contact';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const { data } = await axios.post('https://portfolio-mern-boij.onrender.com/api/contact', {
        ...formData,
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

  return (
    <section style={{ padding: '4rem 2rem', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
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
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        />

        <textarea
          name="message"
          placeholder="Your Message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#888' : '#007BFF',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>

        {(successMessage || errorMessage) && (
          <div
            style={{
              marginTop: '1rem',
              fontWeight: 'bold',
              color: successMessage ? 'green' : 'red',
            }}
          >
            {successMessage || errorMessage}
          </div>
        )}
      </form>
    </section>
  );
};

export default Contact;