import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(protect);

// GET  /api/users        — Admin + Manager can list users
// POST /api/users        — Admin only can create
router.route('/')
  .get(restrictTo('admin', 'manager'), getUsers)
  .post(restrictTo('admin'), createUser);

// GET    /api/users/:id  — Admin + Manager
// PUT    /api/users/:id  — Admin only
// DELETE /api/users/:id  — Admin only
router.route('/:id')
  .get(restrictTo('admin', 'manager'), getUserById)
  .put(restrictTo('admin'), updateUser)
  .delete(restrictTo('admin'), deleteUser);

export default router;
