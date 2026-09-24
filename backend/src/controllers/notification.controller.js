import notificationService from '../services/notification.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = parseInt(req.query.limit, 10) || 20;

    const data = await notificationService.getUserNotifications(req.user._id, {
      unreadOnly,
      limit
    });

    return successResponse(res, 'Notifications retrieved', data, 200);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.notificationId,
      req.user._id
    );
    return successResponse(res, 'Notification marked as read', { notification }, 200);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    return successResponse(res, 'All notifications marked as read', result, 200);
  } catch (error) {
    next(error);
  }
};
