'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Which roles can access which routes
const ROUTE_ACCESS: Record<string, string[]> = {
  '/users':     ['admin', 'manager'],
  '/users/new': ['admin'],
  '/roles':     ['admin', 'manager'],
  '/settings':  ['admin', 'manager', 'user'],
  '/dashboard': ['admin', 'manager', 'user'],
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in → go to login
    if (!isAuthenticated) { router.push('/login'); return; }

    // Check route-level access
    const role = user?.role?.name;
    if (!role) return;

    // Find matching route rule (check exact then prefix)
    const matchedRoute = Object.keys(ROUTE_ACCESS).find(route =>
      pathname === route || pathname.startsWith(route + '/')
    );

    if (matchedRoute) {
      const allowed = ROUTE_ACCESS[matchedRoute];
      if (!allowed.includes(role)) {
        // Redirect to dashboard if not allowed
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050c12' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#00FFB8', borderTopColor: 'transparent' }} />
          <p style={{ fontSize: 13, color: '#6B9BAA' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
