import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats — Admin + Manager
router.get('/stats', protect, restrictTo('admin', 'manager'), getStats);

export default router;
