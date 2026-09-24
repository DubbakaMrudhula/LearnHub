import { Router } from 'express';
import {
  getAdminAnalytics,
  getInstructorAnalytics,
  getReviewerAnalytics
} from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize('admin'), getAdminAnalytics);
router.get('/instructor', authorize('instructor', 'admin'), getInstructorAnalytics);
router.get('/reviewer', authorize('reviewer', 'admin'), getReviewerAnalytics);

export default router;
