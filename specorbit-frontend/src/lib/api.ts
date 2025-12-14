import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Point to your backend
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Allows cookies if we use them later
});

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 (Unauthorized), we might want to logout the user
    if (error.response?.status === 401) {
      console.warn('Unauthorized access');
    }
    return Promise.reject(error);
  }
);