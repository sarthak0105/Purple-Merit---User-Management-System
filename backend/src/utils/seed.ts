import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';
import { User } from '../models/User';

// ── 1. Permissions ────────────────────────────────────────────────────────────
const PERMISSIONS = [
  // users
  { name: 'view_users',   description: 'View all users',          category: 'users'     },
  { name: 'create_user',  description: 'Create a new user',       category: 'users'     },
  { name: 'edit_user',    description: 'Edit existing users',     category: 'users'     },
  { name: 'delete_user',  description: 'Delete users',            category: 'users'     },
  // roles
  { name: 'view_roles',   description: 'View all roles',          category: 'roles'     },
  { name: 'create_role',  description: 'Create a new role',       category: 'roles'     },
  { name: 'edit_role',    description: 'Edit existing roles',     category: 'roles'     },
  { name: 'delete_role',  description: 'Delete roles',            category: 'roles'     },
  // dashboard
  { name: 'view_dashboard', description: 'Access the dashboard',  category: 'dashboard' },
  { name: 'view_stats',     description: 'View system stats',     category: 'dashboard' },
  // settings
  { name: 'view_settings',  description: 'View settings',         category: 'settings'  },
  { name: 'edit_settings',  description: 'Edit system settings',  category: 'settings'  },
] as const;

// ── 2. Role → permission mapping ──────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'view_users', 'create_user', 'edit_user', 'delete_user',
    'view_roles', 'create_role', 'edit_role', 'delete_role',
    'view_dashboard', 'view_stats',
    'view_settings', 'edit_settings',
  ],
  manager: [
    'view_users', 'edit_user',
    'view_roles',
    'view_dashboard', 'view_stats',
  ],
  user: [
    'view_dashboard',
  ],
};

// ── 3. Demo users ─────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { name: 'John Admin',   email: 'admin@example.com',   password: 'password123', role: 'admin'   },
  { name: 'Jane Manager', email: 'manager@example.com', password: 'password123', role: 'manager' },
  { name: 'Bob User',     email: 'user@example.com',    password: 'password123', role: 'user'    },
];

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seed() {
  await connectDB();

  console.log('\n🌱 Starting seed...\n');

  // Clear existing data
  await Promise.all([
    Permission.deleteMany({}),
    Role.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Insert permissions
  const createdPermissions = await Permission.insertMany(PERMISSIONS);
  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // Build name → _id map
  const permMap = new Map(
    createdPermissions.map(p => [p.name, p._id])
  );

  // Insert roles with resolved permission IDs
  const roleData = Object.entries(ROLE_PERMISSIONS).map(([name, perms]) => ({
    name,
    description:
      name === 'admin'   ? 'Full system access with all permissions' :
      name === 'manager' ? 'User management and reporting access'    :
                           'Basic access — own profile only',
    permissions: perms.map(p => permMap.get(p)).filter(Boolean),
  }));

  const createdRoles = await Role.insertMany(roleData);
  console.log(`✅ Created ${createdRoles.length} roles`);

  // Build role name → _id map
  const roleMap = new Map(createdRoles.map(r => [r.name, r._id]));

  // Insert demo users
  for (const u of DEMO_USERS) {
    await User.create({
      name:     u.name,
      email:    u.email,
      password: u.password,
      role:     roleMap.get(u.role),
      status:   'active',
    });
  }
  console.log(`✅ Created ${DEMO_USERS.length} demo users`);

  console.log('\n📋 Demo credentials:');
  DEMO_USERS.forEach(u =>
    console.log(`   ${u.role.padEnd(8)} → ${u.email} / ${u.password}`)
  );

  console.log('\n✨ Seed complete!\n');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
