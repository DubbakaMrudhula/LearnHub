import { Router } from 'express';
import {
  enroll,
  getMyEnrollments,
  markLessonComplete,
  checkEnrollment
} from '../controllers/enrollment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/my-enrollments', getMyEnrollments);
router.get('/check/:courseId', checkEnrollment);
router.post('/:courseId', enroll);
router.post('/:courseId/lessons/:lessonId/complete', markLessonComplete);

export default router;
