import { Router } from 'express';
import {
  createAssignment,
  getFeaturedAssignment,
  getCourseAssignments,
  submitAssignment,
  gradeSubmission,
  getAssignmentSubmissions,
  getMySubmission
} from '../controllers/assignment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Featured assignment
router.get('/featured', getFeaturedAssignment);

// Student & Enrolled
router.get('/course/:courseId', getCourseAssignments);
router.get('/:assignmentId/my-submission', getMySubmission);
router.post('/:assignmentId/submit', submitAssignment);

// Instructor / Reviewer / Admin
router.post('/', authorize('instructor', 'admin'), createAssignment);
router.get('/:assignmentId/submissions', authorize('instructor', 'reviewer', 'admin'), getAssignmentSubmissions);
router.post('/submissions/:submissionId/grade', authorize('instructor', 'reviewer', 'admin'), gradeSubmission);

export default router;
