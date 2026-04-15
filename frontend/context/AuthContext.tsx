'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContext as IAuthContext, LoginResponse } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount — restore session from stored token
  useEffect(() => {
    const stored = ApiClient.getToken();
    if (stored) {
      setToken(stored);
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  /** Call GET /api/auth/me to restore the user object from a stored JWT */
  const fetchCurrentUser = async () => {
    try {
      const res = await ApiClient.get<User>(API_ENDPOINTS.ME);
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        // Token is invalid / expired — clear it
        ApiClient.clearToken();
        setToken(null);
        setUser(null);
      }
    } catch {
      ApiClient.clearToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /** POST /api/auth/login */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, { email, password });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Login failed');
      }

      const { token: jwt, user: loggedInUser } = res.data;
      ApiClient.setToken(jwt);
      setToken(jwt);
      setUser(loggedInUser);
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  /** POST /api/auth/logout then clear local state */
  const logout = async () => {
    try {
      await ApiClient.post(API_ENDPOINTS.LOGOUT);
    } catch {
      // Ignore — we clear locally regardless
    } finally {
      ApiClient.clearToken();
      setToken(null);
      setUser(null);
    }
  };

  const value: IAuthContext = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
