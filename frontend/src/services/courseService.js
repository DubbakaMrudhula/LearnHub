import api from './api';

export const courseService = {
  /**
   * Browse published courses with search, filters, pagination
   * @param {object} params
   */
  getCourses: async (params = {}) => {
    return await api.get('/courses', { params });
  },

  /**
   * Get single course details and curriculum outline
   * @param {string} idOrSlug
   */
  getCourse: async (idOrSlug) => {
    return await api.get(`/courses/${idOrSlug}`);
  },

  /**
   * Get instructor's created courses
   */
  getInstructorCourses: async () => {
    return await api.get('/courses/instructor/my-courses');
  },

  /**
   * Create new course as instructor
   * @param {object} courseData
   */
  createCourse: async (courseData) => {
    return await api.post('/courses', courseData);
  },

  /**
   * Update course
   * @param {string} courseId
   * @param {object} courseData
   */
  updateCourse: async (courseId, courseData) => {
    return await api.put(`/courses/${courseId}`, courseData);
  },

  /**
   * Delete course
   * @param {string} courseId
   */
  deleteCourse: async (courseId) => {
    return await api.delete(`/courses/${courseId}`);
  },

  /**
   * Submit course for content review
   * @param {string} courseId
   */
  submitForReview: async (courseId) => {
    return await api.patch(`/courses/${courseId}/submit`);
  },

  /**
   * Publish approved course
   * @param {string} courseId
   */
  publishCourse: async (courseId) => {
    return await api.patch(`/courses/${courseId}/publish`);
  },

  /**
   * Create module in course
   * @param {string} courseId
   * @param {object} moduleData
   */
  createModule: async (courseId, moduleData) => {
    return await api.post(`/courses/${courseId}/modules`, moduleData);
  },

  /**
   * Delete module
   * @param {string} moduleId
   */
  deleteModule: async (moduleId) => {
    return await api.delete(`/courses/modules/${moduleId}`);
  },

  /**
   * Create lesson in module
   * @param {string} moduleId
   * @param {object} lessonData
   */
  createLesson: async (moduleId, lessonData) => {
    return await api.post(`/courses/modules/${moduleId}/lessons`, lessonData);
  },

  /**
   * Delete lesson
   * @param {string} lessonId
   */
  deleteLesson: async (lessonId) => {
    return await api.delete(`/courses/lessons/${lessonId}`);
  },

  /**
   * Access full lesson content
   * @param {string} lessonId
   */
  getLesson: async (lessonId) => {
    return await api.get(`/courses/lessons/${lessonId}`);
  }
};

export default courseService;
