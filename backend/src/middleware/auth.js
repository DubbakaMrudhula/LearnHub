import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import { AppError } from './errorHandler.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches authenticated user document to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Authentication required. Please log in.', 401, 'NOT_AUTHENTICATED')
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
      }
      return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
    }

    // Fetch user from DB (excluding password)
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError('The account associated with this token no longer exists.', 401, 'USER_NOT_FOUND')
      );
    }

    if (!user.isActive) {
      return next(
        new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED')
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Authorization Middleware (RBAC)
 * Enforces access control based on user role(s).
 * @param {...string} roles Allowed roles (e.g. 'admin', 'instructor', 'reviewer', 'student', 'mentor')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('User not authenticated.', 401, 'NOT_AUTHENTICATED')
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${roles.join(', ')}]`,
          403,
          'INSUFFICIENT_PERMISSION'
        )
      );
    }

    next();
  };
};

export default { authenticate, authorize };
