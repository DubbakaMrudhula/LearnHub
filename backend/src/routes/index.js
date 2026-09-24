import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import courseRoutes from './course.routes.js';
import reviewRoutes from './review.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import quizRoutes from './quiz.routes.js';
import assignmentRoutes from './assignment.routes.js';
import progressRoutes from './progress.routes.js';
import mentorshipRoutes from './mentorship.routes.js';
import aiRoutes from './ai.routes.js';
import certificateRoutes from './certificate.routes.js';
import analyticsRoutes from './analytics.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

// Mount core routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/reviews', reviewRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/progress', progressRoutes);
router.use('/mentorship', mentorshipRoutes);
router.use('/ai', aiRoutes);
router.use('/certificates', certificateRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

// Base API info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to LearnHub API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth (Phase 2)',
      courses: '/api/courses (Phase 3)',
      quizzes: '/api/quizzes (Phase 4)',
      progress: '/api/progress (Phase 5)'
    }
  });
});

export default router;
