import { Request, Response } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

// ── GET /api/dashboard/stats ──────────────────────────────────────────────────
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  // Run all queries in parallel
  const [totalUsers, activeUsers, totalRoles, totalPermissions, recentUsersRaw] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Role.countDocuments(),
      Permission.countDocuments(),
      User.find()
        .select('-password')
        .populate({ path: 'role', populate: { path: 'permissions', model: Permission } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const recentUsers = recentUsersRaw.map((u: any) => {
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
  });

  return sendSuccess(res, {
    totalUsers,
    activeUsers,
    totalRoles,
    totalPermissions,
    recentUsers,
  });
});
