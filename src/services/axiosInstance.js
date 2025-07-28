// services/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://sirius-backend-ahsc.onrender.com',
  headers: { 'Content-Type': 'application/json' }
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
