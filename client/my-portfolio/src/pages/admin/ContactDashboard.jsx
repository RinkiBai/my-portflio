import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('/api/contact/all');
        setContacts(res.data.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await axios.delete(`/api/contact/${id}`);
      setContacts(prev => prev.filter(contact => contact._id !== id));
      toast.success('Contact message deleted ✅');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact message ❌');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading contacts...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Contact Form Messages</h2>
      {contacts.length === 0 ? (
        <p className="text-gray-500">No contact messages found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Message</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{contact.name}</td>
                  <td className="p-2 border">{contact.email}</td>
                  <td className="p-2 border">{contact.message}</td>
                  <td className="p-2 border">{new Date(contact.createdAt).toLocaleString()}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactDashboard;
