import { Router } from 'express';
import { login, logout, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Strict rate limit on login — 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, login);

// POST /api/auth/logout  (protected)
router.post('/logout', protect, logout);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

export default router;
