import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactForm = () => {
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

  // Form JSX below remains same, no changes needed
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
        {/* inputs same as before */}
        {/* ... */}
        {/* success/error message */}
        {(successMessage || errorMessage) && (
          <div style={{ marginTop: '1rem', fontWeight: 'bold', color: successMessage ? 'green' : 'red' }}>
            {successMessage || errorMessage}
          </div>
        )}
      </form>
    </section>
  );
};

export default ContactForm;
