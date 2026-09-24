import User from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * @desc Get all users with filtering, search, and pagination
 * @route GET /api/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (status !== undefined) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    return paginatedResponse(res, 'Users fetched successfully', users, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return successResponse(res, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update user active status (Activate / Deactivate)
 * @route PATCH /api/users/:id/status
 * @access Private/Admin
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      throw new AppError('Field isActive must be a boolean', 400, 'INVALID_INPUT');
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString() && !isActive) {
      throw new AppError('You cannot deactivate your own admin account', 400, 'ACTION_FORBIDDEN');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive } },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    logger.info(`User ${user.email} status changed to isActive=${isActive} by Admin ${req.user.email}`);
    return successResponse(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update user role
 * @route PATCH /api/users/:id/role
 * @access Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['admin', 'instructor', 'reviewer', 'student', 'mentor'];

    if (!allowedRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${allowedRoles.join(', ')}`, 400, 'INVALID_ROLE');
    }

    // Prevent changing own role
    if (req.params.id === req.user._id.toString()) {
      throw new AppError('You cannot change your own role', 400, 'ACTION_FORBIDDEN');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    logger.info(`User ${user.email} role changed to ${role} by Admin ${req.user.email}`);
    return successResponse(res, `User role updated to ${role}`, { user });
  } catch (error) {
    next(error);
  }
};
