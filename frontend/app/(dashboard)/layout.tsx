'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [menuState, setMenuState] = useState<'full' | 'collapsed' | 'hidden'>('full');
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setMenuState('hidden');
        setMobileOpen(false);
      } else {
        setMenuState('full');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMarginLeft = () => {
    if (isMobile) return '0';
    if (menuState === 'hidden') return '0';
    if (menuState === 'collapsed' && isHovered) return '16rem';
    if (menuState === 'collapsed') return '4rem';
    return '16rem';
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white dark:bg-[#0F0F12] overflow-hidden">

        {/* Mobile overlay backdrop */}
        {isMobile && mobileOpen && (
          <div
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <Sidebar
          menuState={menuState}
          setMenuState={setMenuState}
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div
          className="flex flex-1 flex-col transition-all duration-300 ease-in-out min-w-0"
          style={{ marginLeft: getMarginLeft() }}
        >
          <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23] flex-shrink-0 bg-white dark:bg-[#0F0F12]">
            <Navbar
              menuState={menuState}
              setMenuState={setMenuState}
              isMobile={isMobile}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50 dark:bg-[#0F0F12] min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
