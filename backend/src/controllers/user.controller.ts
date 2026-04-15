import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

// ── Validation schemas ────────────────────────────────────────────────────────
const createUserSchema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.string().min(1, 'Role ID is required'),
  status:   z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
});

const updateUserSchema = z.object({
  name:   z.string().min(2).max(50).optional(),
  email:  z.string().email().optional(),
  role:   z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

// ── Helper: populate user for response ───────────────────────────────────────
async function populateUser(userId: unknown) {
  return User.findById(userId)
    .select('-password')
    .populate({
      path: 'role',
      populate: { path: 'permissions', model: Permission },
    })
    .lean();
}

function formatUser(u: any) {
  if (!u) return null;
  const role = u.role as any;
  return {
    id:        u._id.toString(),
    name:      u.name,
    email:     u.email,
    status:    u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    role: {
      id:          role._id.toString(),
      name:        role.name,
      description: role.description,
      createdAt:   role.createdAt,
      permissions: (role.permissions ?? []).map((p: any) => ({
        id: p._id.toString(), name: p.name, description: p.description, category: p.category,
      })),
    },
  };
}

// ── GET /api/users ────────────────────────────────────────────────────────────
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit  = Math.min(50, parseInt(req.query.limit as string) || 10);
  const skip   = (page - 1) * limit;
  const search = (req.query.search as string)?.trim();
  const role   = req.query.role   as string;
  const status = req.query.status as string;

  // Build filter
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (status && ['active','inactive','suspended'].includes(status)) {
    filter.status = status;
  }
  if (role) {
    const roleDoc = await Role.findOne({ name: role.toLowerCase() });
    if (roleDoc) filter.role = roleDoc._id;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .populate({ path: 'role', populate: { path: 'permissions', model: Permission } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return sendPaginated(res, users.map(formatUser), total, page, limit);
});

// ── GET /api/users/:id ────────────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await populateUser(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);
  return sendSuccess(res, formatUser(user));
});

// ── POST /api/users ───────────────────────────────────────────────────────────
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const data = createUserSchema.parse(req.body);

  // Check email uniqueness
  const exists = await User.findOne({ email: data.email });
  if (exists) return sendError(res, 'Email already in use', 409);

  // Validate role exists
  const roleDoc = await Role.findById(data.role);
  if (!roleDoc) return sendError(res, 'Role not found', 404);

  const user = await User.create(data);
  const populated = await populateUser(user._id);
  return sendSuccess(res, formatUser(populated), 201, 'User created successfully');
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const data = updateUserSchema.parse(req.body);

  // Check email uniqueness if changing email
  if (data.email) {
    const exists = await User.findOne({ email: data.email, _id: { $ne: req.params.id } });
    if (exists) return sendError(res, 'Email already in use', 409);
  }

  // Validate role if provided
  if (data.role) {
    const roleDoc = await Role.findById(data.role);
    if (!roleDoc) return sendError(res, 'Role not found', 404);
  }

  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!user) return sendError(res, 'User not found', 404);

  const populated = await populateUser(user._id);
  return sendSuccess(res, formatUser(populated), 200, 'User updated successfully');
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  // Prevent self-deletion
  if (req.user?.userId === req.params.id) {
    return sendError(res, 'You cannot delete your own account', 400);
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);

  return sendSuccess(res, null, 200, 'User deleted successfully');
});
