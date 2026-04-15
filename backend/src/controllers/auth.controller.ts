import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

// ── Validation schemas ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Shape the user object to match the frontend User type exactly */
async function formatUser(user: InstanceType<typeof User>) {
  // Populate role + permissions if not already populated
  const populated = await User.findById(user._id)
    .select('-password')
    .populate({
      path: 'role',
      populate: { path: 'permissions', model: Permission },
    })
    .lean();

  if (!populated) return null;

  const role = populated.role as InstanceType<typeof Role> & {
    _id: unknown;
    permissions: InstanceType<typeof Permission>[];
  };

  // Count users with this role
  const userCount = await User.countDocuments({ role: role._id });

  return {
    id:        populated._id.toString(),
    name:      populated.name,
    email:     populated.email,
    status:    populated.status,
    createdAt: populated.createdAt,
    updatedAt: populated.updatedAt,
    role: {
      id:          role._id.toString(),
      name:        role.name,
      description: role.description,
      userCount,
      createdAt:   role.createdAt,
      permissions: (role.permissions ?? []).map((p: InstanceType<typeof Permission>) => ({
        id:          p._id.toString(),
        name:        p.name,
        description: p.description,
        category:    p.category,
      })),
    },
  };
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Public — returns JWT + formatted user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate body
  const { email, password } = loginSchema.parse(req.body);

  // Find user (explicitly select password since it's excluded by default)
  const user = await User.findOne({ email }).select('+password').populate('role');
  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  // Check status
  if (user.status !== 'active') {
    return sendError(res, 'Your account has been deactivated. Contact an admin.', 403);
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid email or password', 401);
  }

  // Sign JWT
  const role = user.role as InstanceType<typeof Role>;
  const token = signToken({
    userId: user._id.toString(),
    email:  user.email,
    role:   role.name,
  });

  // Format user for response
  const formatted = await formatUser(user);

  return sendSuccess(res, { token, user: formatted }, 200, 'Login successful');
});

/**
 * POST /api/auth/logout
 * Protected — client just discards the token; we confirm server-side
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, null, 200, 'Logged out successfully');
});

/**
 * GET /api/auth/me
 * Protected — returns the currently authenticated user
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const formatted = await formatUser(
    { _id: req.user!.userId } as InstanceType<typeof User>
  );

  if (!formatted) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, formatted);
});
