import { AppError } from './errorHandler.js';

/**
 * 404 Route Not Found Handler
 */
export const notFound = (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl} - Route not found`, 404, 'NOT_FOUND'));
};

export default notFound;
