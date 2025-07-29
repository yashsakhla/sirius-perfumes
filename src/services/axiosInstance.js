import axios from 'axios';
import { url } from '../env.config';

// Create the Axios instance
const instance = axios.create({
  baseURL: url,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token on every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired or invalid JWT
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized error—JWT probably expired or invalid
    localStorage.removeItem('authToken'); // optional: clear invalid token
    localStorage.removeItem("googleUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accountDetails");
    localStorage.removeItem("offerPopupShown");
      window.location.href = '/login'; // or use your login route
    }
    return Promise.reject(error);
  }
);

export default instance;
