import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('learnhub_user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('learnhub_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-verify authentication token on initial load
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('learnhub_token');
      if (storedToken) {
        try {
          const response = await authService.getMe();
          if (response?.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('learnhub_user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { user: loggedInUser, token: authToken } = response.data;

      localStorage.setItem('learnhub_token', authToken);
      localStorage.setItem('learnhub_user', JSON.stringify(loggedInUser));

      setToken(authToken);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      const { user: registeredUser, token: authToken } = response.data;

      localStorage.setItem('learnhub_token', authToken);
      localStorage.setItem('learnhub_user', JSON.stringify(registeredUser));

      setToken(authToken);
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('learnhub_token');
    localStorage.removeItem('learnhub_user');
    setToken(null);
    setUser(null);
    setError(null);
    try {
      authService.logout();
    } catch {
      // Ignore background logout error
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('learnhub_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      if (response.data?.token) {
        setToken(response.data.token);
        localStorage.setItem('learnhub_token', response.data.token);
      }
      return response;
    } catch (err) {
      setError(err.message || 'Failed to change password');
      throw err;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
