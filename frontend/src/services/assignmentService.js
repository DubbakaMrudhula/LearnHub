import api from './api';

export const assignmentService = {
  getCourseAssignments: async (courseId) => {
    return await api.get(`/assignments/course/${courseId}`);
  },

  getFeaturedAssignment: async () => {
    return await api.get('/assignments/featured');
  },

  getMySubmission: async (assignmentId) => {
    return await api.get(`/assignments/${assignmentId}/my-submission`);
  },

  submitAssignment: async (assignmentId, data) => {
    return await api.post(`/assignments/${assignmentId}/submit`, data);
  },

  createAssignment: async (assignmentData) => {
    return await api.post('/assignments', assignmentData);
  },

  getAssignmentSubmissions: async (assignmentId) => {
    return await api.get(`/assignments/${assignmentId}/submissions`);
  },

  gradeSubmission: async (submissionId, grade, feedback) => {
    return await api.post(`/assignments/submissions/${submissionId}/grade`, { grade, feedback });
  }
};

export default assignmentService;
