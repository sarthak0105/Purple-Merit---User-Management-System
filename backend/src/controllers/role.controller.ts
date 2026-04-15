import { Request, Response } from 'express';
import { z } from 'zod';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

// ── Validation schemas ────────────────────────────────────────────────────────
const createRoleSchema = z.object({
  name:        z.string().min(2).max(30),
  description: z.string().min(5).max(200),
  permissions: z.array(z.string()).optional().default([]),
});

const updateRoleSchema = z.object({
  name:        z.string().min(2).max(30).optional(),
  description: z.string().min(5).max(200).optional(),
  permissions: z.array(z.string()).optional(),
});

// ── Helper: format role for response ─────────────────────────────────────────
async function formatRole(role: any) {
  if (!role) return null;
  const userCount = await User.countDocuments({ role: role._id });
  return {
    id:          role._id.toString(),
    name:        role.name,
    description: role.description,
    userCount,
    createdAt:   role.createdAt,
    permissions: (role.permissions ?? []).map((p: any) => ({
      id: p._id.toString(), name: p.name, description: p.description, category: p.category,
    })),
  };
}

// ── GET /api/roles ────────────────────────────────────────────────────────────
export const getRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await Role.find().populate('permissions').sort({ name: 1 }).lean();
  const formatted = await Promise.all(roles.map(formatRole));
  return sendSuccess(res, formatted);
});

// ── GET /api/roles/:id ────────────────────────────────────────────────────────
export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const role = await Role.findById(req.params.id).populate('permissions').lean();
  if (!role) return sendError(res, 'Role not found', 404);
  return sendSuccess(res, await formatRole(role));
});

// ── POST /api/roles ───────────────────────────────────────────────────────────
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const data = createRoleSchema.parse(req.body);

  const exists = await Role.findOne({ name: data.name.toLowerCase() });
  if (exists) return sendError(res, 'Role name already exists', 409);

  // Validate all permission IDs exist
  if (data.permissions.length > 0) {
    const count = await Permission.countDocuments({ _id: { $in: data.permissions } });
    if (count !== data.permissions.length) return sendError(res, 'One or more permission IDs are invalid', 400);
  }

  const role = await Role.create({ ...data, name: data.name.toLowerCase() });
  const populated = await Role.findById(role._id).populate('permissions').lean();
  return sendSuccess(res, await formatRole(populated), 201, 'Role created successfully');
});

// ── PUT /api/roles/:id ────────────────────────────────────────────────────────
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const data = updateRoleSchema.parse(req.body);

  if (data.name) {
    const exists = await Role.findOne({ name: data.name.toLowerCase(), _id: { $ne: req.params.id } });
    if (exists) return sendError(res, 'Role name already exists', 409);
    data.name = data.name.toLowerCase();
  }

  if (data.permissions && data.permissions.length > 0) {
    const count = await Permission.countDocuments({ _id: { $in: data.permissions } });
    if (count !== data.permissions.length) return sendError(res, 'One or more permission IDs are invalid', 400);
  }

  const role = await Role.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    .populate('permissions').lean();
  if (!role) return sendError(res, 'Role not found', 404);

  return sendSuccess(res, await formatRole(role), 200, 'Role updated successfully');
});

// ── DELETE /api/roles/:id ─────────────────────────────────────────────────────
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  // Prevent deleting a role that has users assigned
  const userCount = await User.countDocuments({ role: req.params.id });
  if (userCount > 0) {
    return sendError(res, `Cannot delete role — ${userCount} user(s) are assigned to it`, 400);
  }

  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) return sendError(res, 'Role not found', 404);

  return sendSuccess(res, null, 200, 'Role deleted successfully');
});
