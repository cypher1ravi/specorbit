import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

// Create a configured axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Point to your backend
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Allows cookies if we use them later
});

// Add a request interceptor to automatically add the auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 (Unauthorized), we might want to logout the user
    if (error.response?.status === 401) {
      console.warn('Unauthorized access');
      // Here you could trigger a logout action
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);