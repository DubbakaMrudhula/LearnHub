import api from './api';

export const analyticsService = {
  getAdminAnalytics: async () => {
    return await api.get('/analytics/admin');
  },

  getInstructorAnalytics: async () => {
    return await api.get('/analytics/instructor');
  },

  getReviewerAnalytics: async () => {
    return await api.get('/analytics/reviewer');
  }
};

export default analyticsService;
