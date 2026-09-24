import { Router } from 'express';
import {
  getMentors,
  bookSession,
  getMentorSessions,
  getStudentSessions,
  completeSession,
  inspectLearnerProgress
} from '../controllers/mentorship.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Public/learner access
router.get('/mentors', getMentors);
router.post('/sessions', bookSession);
router.get('/student/sessions', getStudentSessions);

// Mentor / Instructor / Admin access
router.get('/mentor/sessions', authorize('mentor', 'instructor', 'admin'), getMentorSessions);
router.patch('/sessions/:sessionId/complete', authorize('mentor', 'instructor', 'admin'), completeSession);
router.get('/learners/:studentId/progress', authorize('mentor', 'instructor', 'admin'), inspectLearnerProgress);

export default router;
