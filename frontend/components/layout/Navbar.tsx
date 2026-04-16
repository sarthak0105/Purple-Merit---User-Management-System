'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu, X, ChevronDown, User, LogOut,
  UserPlus, Users, LayoutDashboard, Sun, Moon, Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  menuState: 'full' | 'collapsed' | 'hidden';
  setMenuState: (s: 'full' | 'collapsed' | 'hidden') => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function Navbar({ menuState, setMenuState, isMobile, mobileOpen, setMobileOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropOpen, setDropOpen] = useState(false);
  const [isDark, setIsDark]     = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark'); localStorage.setItem('theme', 'light'); setIsDark(false);
    } else {
      html.classList.add('dark'); localStorage.setItem('theme', 'dark'); setIsDark(true);
    }
  };

  const roleName = user?.role?.name ?? 'user';
  const isAdmin   = roleName === 'admin';
  const isManager = roleName === 'manager';

  const toggleDesktopMenu = () => {
    const next = menuState === 'full' ? 'collapsed' : menuState === 'collapsed' ? 'hidden' : 'full';
    setMenuState(next);
  };

  return (
    <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6">

      {/* ── Left ── */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        {/* Desktop menu toggle */}
        {!isMobile && (
          <button
            onClick={toggleDesktopMenu}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Brand on mobile */}
        {isMobile && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-gray-900 font-bold text-xs">PM</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Purple Merit</span>
          </Link>
        )}

        {/* Desktop breadcrumb */}
        {!isMobile && (
          <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/dashboard" className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <span className="hidden md:inline">/</span>
            <span className="hidden md:inline text-gray-900 dark:text-white font-medium capitalize">{roleName}</span>
          </nav>
        )}
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1">

        {/* CTA — desktop only */}
        {isAdmin && (
          <Link href="/users/new" className="hidden sm:block">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden md:inline">New User</span>
            </button>
          </Link>
        )}
        {isManager && (
          <Link href="/users" className="hidden sm:block">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Users</span>
            </button>
          </Link>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen(d => !d)}
            className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors"
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
              <div className="dropdown-enter absolute right-0 top-11 w-52 z-50 bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] rounded-xl shadow-xl overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2F2F35]">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 dark:bg-[#2F2F35] text-gray-600 dark:text-gray-400 capitalize">
                    {roleName}
                  </span>
                </div>

                <div className="py-1">
                  {/* Mobile-only nav links */}
                  {isMobile && (
                    <>
                      {isAdmin && (
                        <Link href="/users/new" onClick={() => setDropOpen(false)}>
                          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors text-left">
                            <UserPlus className="h-4 w-4" /> New User
                          </button>
                        </Link>
                      )}
                      <div className="border-t border-gray-100 dark:border-[#2F2F35] my-1" />
                    </>
                  )}

                  <Link href="/settings" onClick={() => setDropOpen(false)}>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors text-left">
                      <Settings className="h-4 w-4" /> Settings
                    </button>
                  </Link>

                  <button
                    onClick={() => { toggleTheme(); setDropOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors text-left"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  <div className="border-t border-gray-100 dark:border-[#2F2F35] my-1" />

                  <button
                    onClick={() => { setDropOpen(false); logout(); router.push('/login'); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
