import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public: list active categories
router.get('/', getCategories);

// Admin: create category
router.post('/', authenticate, authorize('admin'), createCategory);

export default router;
