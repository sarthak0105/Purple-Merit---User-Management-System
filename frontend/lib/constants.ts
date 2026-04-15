// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ME: `${API_BASE_URL}/api/auth/me`,

  // Users
  USERS: `${API_BASE_URL}/api/users`,
  USER: (id: string) => `${API_BASE_URL}/api/users/${id}`,

  // Roles
  ROLES: `${API_BASE_URL}/api/roles`,
  ROLE: (id: string) => `${API_BASE_URL}/api/roles/${id}`,

  // Permissions
  PERMISSIONS: `${API_BASE_URL}/api/permissions`,

  // Dashboard
  STATS: `${API_BASE_URL}/api/dashboard/stats`,
};

// Permissions
export const PERMISSIONS = {
  // User permissions
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',

  // Role permissions
  VIEW_ROLES: 'view_roles',
  CREATE_ROLE: 'create_role',
  EDIT_ROLE: 'edit_role',
  DELETE_ROLE: 'delete_role',

  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_STATS: 'view_stats',

  // Settings
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
} as const;

// Roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.CREATE_ROLE,
    PERMISSIONS.EDIT_ROLE,
    PERMISSIONS.DELETE_ROLE,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STATS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STATS,
  ],
  [ROLES.USER]: [PERMISSIONS.VIEW_DASHBOARD],
};

// User status colors
export const STATUS_COLORS: Record<string, string> = {
  active: '#00FFA3',
  inactive: '#6B8F8F',
  suspended: '#FF4D4F',
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZES = [5, 10, 20, 50];

// Navigation items
export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { id: 'users', label: 'Users', href: '/users', icon: 'Users' },
  { id: 'roles', label: 'Roles & Permissions', href: '/roles', icon: 'Shield' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'Settings' },
];
