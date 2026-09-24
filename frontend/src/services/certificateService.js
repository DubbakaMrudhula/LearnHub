import api from './api';

export const certificateService = {
  issueCertificate: async (courseId) => {
    return await api.post(`/certificates/issue/${courseId}`);
  },

  getMyCertificates: async () => {
    return await api.get('/certificates/my-certificates');
  },

  verifyCertificate: async (certificateCode) => {
    return await api.get(`/certificates/verify/${certificateCode}`);
  },

  getDownloadUrl: (certificateId) => {
    const baseURL = api.defaults.baseURL || 'http://localhost:5000/api';
    return `${baseURL}/certificates/${certificateId}/download`;
  }
};

export default certificateService;
