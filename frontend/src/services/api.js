import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Pre-configured Axios instance for LearnHub
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('learnhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API responses & handle 401s
api.interceptors.response.use(
  (response) => {
    // Backend sends { success: true, message: ..., data: ... }
    return response.data;
  },
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errorCode: error.response?.data?.error || 'UNKNOWN_ERROR',
      statusCode: error.response?.status || 500,
      details: error.response?.data?.details || null,
    };

    // Auto-logout on token expiration / unauthorized
    if (customError.statusCode === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('learnhub_token');
      localStorage.removeItem('learnhub_user');
      // In future phases, dispatch auth logout event
    }

    return Promise.reject(customError);
  }
);

export default api;
