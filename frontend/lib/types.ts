// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'roles' | 'dashboard' | 'settings';
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthContext {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentUsers: User[];
}
