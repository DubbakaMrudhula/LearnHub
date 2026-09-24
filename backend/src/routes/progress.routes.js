import { Router } from 'express';
import {
  getCourseProgress,
  getStudentDashboard,
  checkCertificateEligibility
} from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getStudentDashboard);
router.get('/course/:courseId', getCourseProgress);
router.get('/certificate-eligibility/:courseId', checkCertificateEligibility);

export default router;
