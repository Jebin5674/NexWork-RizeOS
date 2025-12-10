import axios from 'axios';

// This creates an Axios instance that reads the URL from your .env file
// If it can't find it, it defaults to localhost for local testing.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export default api;