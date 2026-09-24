import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes in this module require authentication and 'admin' role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/role', updateUserRole);

export default router;
