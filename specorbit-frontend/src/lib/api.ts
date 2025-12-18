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

// Add a response interceptor to handle errors globally (auto-refresh on 401)
let isRefreshing = false as boolean;
let failedQueue: Array<{ resolve: (token?: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token || undefined);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token: any) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh');
        const token = res.data.accessToken;

        // Update store
        useAuthStore.getState().setAuth(res.data.user, token);

        processQueue(null, token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Logout if refresh failed
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
