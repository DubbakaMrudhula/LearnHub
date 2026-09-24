import api from './api';

/**
 * Authentication and User Service
 */
export const authService = {
  /**
   * Register a new user
   * @param {object} userData
   */
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  /**
   * Login user with credentials
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  /**
   * Get current authenticated user profile
   */
  getMe: async () => {
    return await api.get('/auth/me');
  },

  /**
   * Update profile fields (name, bio, skills, learningGoals)
   * @param {object} profileData
   */
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  },

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  changePassword: async (currentPassword, newPassword) => {
    return await api.put('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Request password reset token
   * @param {string} email
   */
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} password
   */
  resetPassword: async (token, password) => {
    return await api.put(`/auth/reset-password/${token}`, { password });
  },

  /**
   * Logout user
   */
  logout: async () => {
    return await api.post('/auth/logout');
  }
};

export default authService;
