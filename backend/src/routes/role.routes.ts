import { Router } from 'express';
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from '../controllers/role.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// All role routes require authentication
router.use(protect);

// GET  /api/roles        — All authenticated users
// POST /api/roles        — Admin only
router.route('/')
  .get(getRoles)
  .post(restrictTo('admin'), createRole);

// GET    /api/roles/:id  — All authenticated users
// PUT    /api/roles/:id  — Admin only
// DELETE /api/roles/:id  — Admin only
router.route('/:id')
  .get(getRoleById)
  .put(restrictTo('admin'), updateRole)
  .delete(restrictTo('admin'), deleteRole);

export default router;
