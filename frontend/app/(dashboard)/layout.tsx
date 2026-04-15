'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden relative"
        style={{ background: '#050c12' }}>

        {/* ── BIG vivid gradient orbs ── */}
        {/* Top-right teal orb */}
        <div className="fixed pointer-events-none z-0"
          style={{
            top: '-120px', right: '-80px',
            width: '600px', height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(0,255,180,0.22) 0%, rgba(0,220,160,0.12) 30%, transparent 65%)',
            filter: 'blur(60px)',
          }} />

        {/* Bottom-left cyan orb */}
        <div className="fixed pointer-events-none z-0"
          style={{
            bottom: '-100px', left: '180px',
            width: '550px', height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(0,180,255,0.18) 0%, rgba(0,150,220,0.10) 30%, transparent 65%)',
            filter: 'blur(70px)',
          }} />

        {/* Center-right pink/purple orb */}
        <div className="fixed pointer-events-none z-0"
          style={{
            top: '35%', right: '15%',
            width: '400px', height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(168,85,247,0.14) 0%, rgba(255,45,111,0.08) 40%, transparent 65%)',
            filter: 'blur(80px)',
          }} />

        {/* Mid-left subtle teal fill */}
        <div className="fixed pointer-events-none z-0"
          style={{
            top: '20%', left: '10%',
            width: '350px', height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(0,255,180,0.08) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }} />

        {/* ── Floating Sidebar ── */}
        <div className="p-3 flex-shrink-0 relative z-10">
          <Sidebar />
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
          <div className="px-4 pt-3 flex-shrink-0">
            <Navbar />
          </div>
          <main className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
