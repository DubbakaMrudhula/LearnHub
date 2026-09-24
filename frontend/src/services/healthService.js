import api from './api';

/**
 * Service to fetch server health check status
 */
export const healthService = {
  getHealth: async () => {
    return await api.get('/health');
  },
};

export default healthService;
