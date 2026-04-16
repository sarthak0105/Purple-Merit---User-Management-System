'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, ShieldCheck, Settings, LogOut,
} from 'lucide-react';

interface SidebarProps {
  menuState: 'full' | 'collapsed' | 'hidden';
  setMenuState: (s: 'full' | 'collapsed' | 'hidden') => void;
  isHovered: boolean;
  setIsHovered: (v: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const NAV_BY_ROLE: Record<string, { id: string; label: string; href: string; icon: any }[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'users',     label: 'Users',     href: '/users',     icon: Users           },
    { id: 'roles',     label: 'Roles',     href: '/roles',     icon: ShieldCheck     },
    { id: 'settings',  label: 'Settings',  href: '/settings',  icon: Settings        },
  ],
  manager: [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'users',     label: 'Users',     href: '/users',     icon: Users           },
    { id: 'roles',     label: 'Roles',     href: '/roles',     icon: ShieldCheck     },
    { id: 'settings',  label: 'Settings',  href: '/settings',  icon: Settings        },
  ],
  user: [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'settings',  label: 'Settings',  href: '/settings',  icon: Settings        },
  ],
};

export function Sidebar({ menuState, setMenuState, isHovered, setIsHovered, isMobile, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  const roleName = user?.role?.name ?? 'user';
  const nav      = NAV_BY_ROLE[roleName] ?? NAV_BY_ROLE.user;

  // On mobile: show if mobileOpen. On desktop: show based on menuState
  const isVisible = isMobile ? mobileOpen : menuState !== 'hidden';
  const showText  = isMobile ? true : (menuState === 'full' || (menuState === 'collapsed' && isHovered));

  const getSidebarWidth = () => {
    if (isMobile) return 'w-72';
    if (menuState === 'collapsed' && isHovered) return 'w-64';
    if (menuState === 'collapsed') return 'w-16';
    return 'w-64';
  };

  const handleNavClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  if (!isVisible && !isMobile) return null;

  return (
    <nav
      className={`
        fixed inset-y-0 left-0 z-[60]
        bg-white dark:bg-[#0F0F12]
        border-r border-gray-200 dark:border-[#1F1F23]
        transition-all duration-300 ease-in-out
        ${isMobile
          ? `${getSidebarWidth()} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
          : `${getSidebarWidth()} ${menuState === 'hidden' ? 'w-0 border-r-0 overflow-hidden' : ''}`
        }
      `}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div className="h-full flex flex-col">

        {/* ── Brand ── */}
        <div className="h-16 px-3 flex items-center border-b border-gray-200 dark:border-[#1F1F23] flex-shrink-0">
          {showText ? (
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white dark:text-gray-900 font-bold text-sm">PM</span>
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-white">Purple Merit</span>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-sm">PM</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          {showText && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Navigation
            </p>
          )}
          <div className="space-y-0.5">
            {nav.map(({ id, label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={id} href={href} onClick={handleNavClick}>
                  <div className={`
                    flex items-center py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-150
                    ${showText ? 'px-3' : 'px-3 justify-center'}
                    ${active
                      ? 'bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23] hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  title={!showText ? label : undefined}>
                    {active && showText && (
                      <span className="absolute left-0 w-0.5 h-5 bg-gray-900 dark:bg-white rounded-r-full" />
                    )}
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {showText && <span className="ml-3">{label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── User + Sign out ── */}
        <div className="px-2 py-4 border-t border-gray-200 dark:border-[#1F1F23] space-y-1 flex-shrink-0">
          {showText && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1F1F23] mb-2">
              <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user?.role?.name}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => { logout(); router.push('/login'); }}
            className={`
              w-full flex items-center py-2.5 text-sm rounded-lg transition-colors cursor-pointer
              text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23] hover:text-red-600 dark:hover:text-red-400
              ${showText ? 'px-3' : 'px-3 justify-center'}
            `}
            title={!showText ? 'Sign out' : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {showText && <span className="ml-3">Sign out</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
