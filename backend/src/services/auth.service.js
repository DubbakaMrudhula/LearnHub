import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class AuthService {
  /**
   * Register a new user
   * @param {object} userData
   */
  async register(userData) {
    const { name, email, password, role, bio, skills, learningGoals } = userData;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'DUPLICATE_EMAIL');
    }

    // Disallow self-registering directly as admin
    const assignedRole = role === 'admin' ? 'student' : (role || 'student');

    // Create user document
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      bio: bio || '',
      skills: Array.isArray(skills) ? skills : [],
      learningGoals: Array.isArray(learningGoals) ? learningGoals : []
    });

    const token = user.generateAuthToken();
    logger.info(`New user registered: ${user.email} (${user.role})`);

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Authenticate user with email & password
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    // Select password field explicitly
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = user.generateAuthToken();
    logger.info(`User logged in: ${user.email} (${user.role})`);

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Get user profile by ID
   * @param {string} userId
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user.toJSON();
  }

  /**
   * Update user profile fields
   * @param {string} userId
   * @param {object} updateData
   */
  async updateProfile(userId, updateData) {
    const allowedFields = ['name', 'bio', 'skills', 'learningGoals', 'profileImage'];
    const filteredUpdate = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdate },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    logger.info(`User profile updated: ${user.email}`);
    return user.toJSON();
  }

  /**
   * Change user password with current password verification
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password does not match', 400, 'INCORRECT_CURRENT_PASSWORD');
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateAuthToken();
    logger.info(`Password changed for: ${user.email}`);

    return { token };
  }

  /**
   * Generate password reset token
   * @param {string} email
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Return ambiguous message to prevent email enumeration
      return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    logger.info(`Password reset token generated for: ${user.email}`);

    return {
      message: 'Password reset token generated successfully',
      resetToken // In development / test environment, return token for testing
    };
  }

  /**
   * Reset password using token
   * @param {string} token
   * @param {string} newPassword
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Reset token is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const authToken = user.generateAuthToken();
    logger.info(`Password successfully reset for: ${user.email}`);

    return { token: authToken };
  }
}

export const authService = new AuthService();
export default authService;
