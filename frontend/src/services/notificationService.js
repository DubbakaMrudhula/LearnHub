import api from './api';

export const notificationService = {
  getMyNotifications: async (options = {}) => {
    return await api.get('/notifications', { params: options });
  },

  markAsRead: async (notificationId) => {
    return await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return await api.patch('/notifications/mark-all-read');
  }
};

export default notificationService;
