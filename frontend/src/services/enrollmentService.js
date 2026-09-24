import api from './api';

export const enrollmentService = {
  enroll: async (courseId) => {
    return await api.post(`/enrollments/${courseId}`);
  },

  getMyEnrollments: async () => {
    return await api.get('/enrollments/my-enrollments');
  },

  checkEnrollment: async (courseId) => {
    return await api.get(`/enrollments/check/${courseId}`);
  },

  markLessonComplete: async (courseId, lessonId) => {
    return await api.post(`/enrollments/${courseId}/lessons/${lessonId}/complete`);
  }
};

export default enrollmentService;
