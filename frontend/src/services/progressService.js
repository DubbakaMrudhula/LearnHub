import api from './api';

export const progressService = {
  getCourseProgress: async (courseId) => {
    return await api.get(`/progress/course/${courseId}`);
  },

  getStudentDashboard: async () => {
    return await api.get('/progress/dashboard');
  },

  checkCertificateEligibility: async (courseId) => {
    return await api.get(`/progress/certificate-eligibility/${courseId}`);
  }
};

export default progressService;
