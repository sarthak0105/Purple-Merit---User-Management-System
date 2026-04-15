'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu, ChevronDown, User, LogOut,
  UserPlus, Users, LayoutDashboard, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  menuState: 'full' | 'collapsed' | 'hidden';
  setMenuState: (s: 'full' | 'collapsed' | 'hidden') => void;
  isMobile: boolean;
}

export function Navbar({ menuState, setMenuState, isMobile }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropOpen, setDropOpen] = useState(false);
  const [isDark, setIsDark]     = useState(false);

  // Sync with actual DOM class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const roleName = user?.role?.name ?? 'user';
  const isAdmin   = roleName === 'admin';
  const isManager = roleName === 'manager';

  const toggleMenu = () => {
    if (isMobile) return;
    const next = menuState === 'full' ? 'collapsed' : menuState === 'collapsed' ? 'hidden' : 'full';
    setMenuState(next);
  };

  return (
    <div className="flex items-center justify-between h-full px-4 lg:px-6">

      {/* ── Left: Menu toggle + breadcrumb ── */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleMenu}
          className="hidden lg:flex p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Toggle Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/dashboard" className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors">
            <LayoutDashboard className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium capitalize">{roleName}</span>
        </nav>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center space-x-1">

        {/* CTA button — role based */}
        {isAdmin && (
          <Link href="/users/new" className="hidden sm:block">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
              <UserPlus className="h-3.5 w-3.5" />
              New User
            </button>
          </Link>
        )}
        {isManager && (
          <Link href="/users" className="hidden sm:block">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
              <Users className="h-3.5 w-3.5" />
              Users
            </button>
          </Link>
        )}

        {/* ── Theme toggle ── */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] hover:text-gray-900 dark:hover:text-white transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen(d => !d)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize leading-tight">{user?.role?.name}</span>
            </div>
            <ChevronDown className="hidden lg:block h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
              <div className="dropdown-enter absolute right-0 top-12 w-56 z-50 bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2F2F35]">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/settings" onClick={() => setDropOpen(false)}>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors text-left">
                      <User className="h-4 w-4" />
                      Profile & Settings
                    </button>
                  </Link>
                  {/* Theme toggle in dropdown too */}
                  <button
                    onClick={() => { toggleTheme(); setDropOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors text-left"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <div className="border-t border-gray-100 dark:border-[#2F2F35] my-1" />
                  <button
                    onClick={() => { setDropOpen(false); logout(); router.push('/login'); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
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
