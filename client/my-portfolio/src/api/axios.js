import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Reads backend base URL from Vite env
  withCredentials: true, // Include cookies if your backend uses sessions/auth cookies
});

// Optional: Add interceptors for request/response if needed, e.g., for auth tokens or error handling

export default instance;
