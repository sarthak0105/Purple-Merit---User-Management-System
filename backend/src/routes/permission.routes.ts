import { Router } from 'express';
import { Permission } from '../models/Permission';
import { protect } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(protect);

// GET /api/permissions — All authenticated users
router.get('/', asyncHandler(async (_req, res) => {
  const permissions = await Permission.find().sort({ category: 1, name: 1 }).lean();
  const formatted = permissions.map(p => ({
    id:          p._id.toString(),
    name:        p.name,
    description: p.description,
    category:    p.category,
  }));
  return sendSuccess(res, formatted);
}));

export default router;
