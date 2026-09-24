import api from './api';

export const mentorshipService = {
  getMentors: async () => {
    return await api.get('/mentorship/mentors');
  },

  bookSession: async (data) => {
    return await api.post('/mentorship/sessions', data);
  },

  getMentorSessions: async () => {
    return await api.get('/mentorship/mentor/sessions');
  },

  getStudentSessions: async () => {
    return await api.get('/mentorship/student/sessions');
  },

  completeSession: async (sessionId, data) => {
    return await api.patch(`/mentorship/sessions/${sessionId}/complete`, data);
  },

  inspectLearnerProgress: async (studentId) => {
    return await api.get(`/mentorship/learners/${studentId}/progress`);
  }
};

export default mentorshipService;
