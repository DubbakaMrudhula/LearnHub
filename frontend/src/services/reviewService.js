import api from './api';

export const reviewService = {
  getPendingReviews: async () => {
    return await api.get('/reviews/pending');
  },

  inspectCourse: async (courseId) => {
    return await api.get(`/reviews/${courseId}/inspect`);
  },

  startReview: async (courseId) => {
    return await api.patch(`/reviews/${courseId}/start-review`);
  },

  submitDecision: async (courseId, action, comments) => {
    return await api.post(`/reviews/${courseId}/decision`, { action, comments });
  }
};

export default reviewService;
