import { Router } from 'express';
import {
  createQuiz,
  getFeaturedQuiz,
  addQuestion,
  getCourseQuizzes,
  getQuizForAttempt,
  submitQuizAttempt,
  getAttemptReview
} from '../controllers/quiz.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Featured / default route
router.get('/featured', getFeaturedQuiz);

// Public / enrolled access
router.get('/course/:courseId', getCourseQuizzes);
router.get('/:quizId/attempt', getQuizForAttempt);
router.post('/:quizId/submit', submitQuizAttempt);
router.get('/attempts/:attemptId', getAttemptReview);

// Instructor / Admin management
router.post('/', authorize('instructor', 'admin'), createQuiz);
router.post('/:quizId/questions', authorize('instructor', 'admin'), addQuestion);

export default router;
