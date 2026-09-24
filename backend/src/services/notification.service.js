import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

export class NotificationService {
  /**
   * Create an in-app notification
   */
  async createNotification(userId, data) {
    const notification = await Notification.create({
      recipient: userId,
      title: data.title,
      message: data.message,
      type: data.type || 'SYSTEM',
      link: data.link || '/',
      isRead: false
    });

    logger.info(`In-app notification sent to user ${userId}: "${notification.title}"`);
    return notification;
  }

  /**
   * Fetch user notifications with unread badge count
   */
  async getUserNotifications(userId, options = {}) {
    const { unreadOnly = false, limit = 20 } = options;
    const filter = { recipient: userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    return {
      notifications,
      unreadCount
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    return { markedCount: result.modifiedCount };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
