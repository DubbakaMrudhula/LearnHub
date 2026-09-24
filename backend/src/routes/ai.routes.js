import { Router } from 'express';
import { getLearningPath, regenerateLearningPath } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/path', getLearningPath);
router.post('/path/generate', regenerateLearningPath);

export default router;
