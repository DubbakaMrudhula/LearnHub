import { Router } from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  submitCourseForReview,
  publishCourse
} from '../controllers/course.controller.js';
import {
  createModule,
  updateModule,
  deleteModule
} from '../controllers/module.controller.js';
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLesson
} from '../controllers/lesson.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/public/:idOrSlug', getCourse);

// Instructor-specific course management
router.get('/instructor/my-courses', authenticate, authorize('instructor', 'admin'), getInstructorCourses);
router.post('/', authenticate, authorize('instructor', 'admin'), createCourse);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourse);
router.patch('/:id/submit', authenticate, authorize('instructor', 'admin'), submitCourseForReview);
router.patch('/:id/publish', authenticate, authorize('instructor', 'admin'), publishCourse);

// Module management routes
router.post('/:courseId/modules', authenticate, authorize('instructor', 'admin'), createModule);
router.put('/modules/:id', authenticate, authorize('instructor', 'admin'), updateModule);
router.delete('/modules/:id', authenticate, authorize('instructor', 'admin'), deleteModule);

// Lesson management routes
router.post('/modules/:moduleId/lessons', authenticate, authorize('instructor', 'admin'), createLesson);
router.put('/lessons/:id', authenticate, authorize('instructor', 'admin'), updateLesson);
router.delete('/lessons/:id', authenticate, authorize('instructor', 'admin'), deleteLesson);

// Lesson content access (enforces enrollment / ownership / preview)
router.get('/lessons/:id', authenticate, getLesson);

// Course by ID or Slug (handles both public and private queries)
router.get('/:idOrSlug', getCourse);

export default router;
