import api from './api';

export const aiService = {
  getLearningPath: async () => {
    return await api.get('/ai/path');
  },

  regenerateLearningPath: async () => {
    return await api.post('/ai/path/generate');
  }
};

export default aiService;
