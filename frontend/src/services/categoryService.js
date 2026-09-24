import api from './api';

export const categoryService = {
  getCategories: async () => {
    return await api.get('/categories');
  }
};

export default categoryService;
