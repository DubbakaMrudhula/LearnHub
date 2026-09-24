import authService from '../services/auth.service.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login user & return JWT token
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, 'Logged in successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get current authenticated user
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return successResponse(res, 'Current user profile retrieved', { user }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update current user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateProfile(req.user._id, req.body);
    return successResponse(res, 'Profile updated successfully', { user: updatedUser }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    return successResponse(res, 'Password changed successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Request password reset token
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return successResponse(res, result.message, { resetToken: result.resetToken }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reset password with token
 * @route PUT /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.params.token, req.body.password);
    return successResponse(res, 'Password reset successful', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Logout user (client-side clears token)
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = async (req, res) => {
  return successResponse(res, 'Logged out successfully', null, 200);
};
