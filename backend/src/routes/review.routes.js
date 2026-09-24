import { Router } from 'express';
import {
  getPendingReviews,
  startReview,
  submitDecision,
  inspectCourse
} from '../controllers/review.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Enforce Reviewer or Admin role for all review routes
router.use(authenticate);
router.use(authorize('reviewer', 'admin'));

router.get('/pending', getPendingReviews);
router.get('/:courseId/inspect', inspectCourse);
router.patch('/:courseId/start-review', startReview);
router.post('/:courseId/decision', submitDecision);

export default router;
