import api from './api';

export const quizService = {
  getCourseQuizzes: async (courseId) => {
    return await api.get(`/quizzes/course/${courseId}`);
  },

  getFeaturedQuiz: async () => {
    return await api.get('/quizzes/featured');
  },

  getQuizForAttempt: async (quizId) => {
    return await api.get(`/quizzes/${quizId}/attempt`);
  },

  submitQuizAttempt: async (quizId, answers) => {
    return await api.post(`/quizzes/${quizId}/submit`, { answers });
  },

  getAttemptReview: async (attemptId) => {
    return await api.get(`/quizzes/attempts/${attemptId}`);
  },

  createQuiz: async (quizData) => {
    return await api.post('/quizzes', quizData);
  },

  addQuestion: async (quizId, questionData) => {
    return await api.post(`/quizzes/${quizId}/questions`, questionData);
  }
};

export default quizService;
