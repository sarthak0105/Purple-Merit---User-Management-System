'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) router.push('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050c12' }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#00FFB8', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden relative" style={{ background: '#050c12' }}>

      {/* Big teal orb top-right */}
      <div className="absolute pointer-events-none"
        style={{ top: '-150px', right: '-100px', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,184,0.2) 0%, rgba(0,255,184,0.08) 35%, transparent 65%)',
          filter: 'blur(60px)' }} />

      {/* Cyan orb bottom-left */}
      <div className="absolute pointer-events-none"
        style={{ bottom: '-100px', left: '-80px', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,200,255,0.16) 0%, rgba(0,200,255,0.06) 35%, transparent 65%)',
          filter: 'blur(70px)' }} />

      {/* Pink orb center */}
      <div className="absolute pointer-events-none"
        style={{ top: '40%', left: '40%', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 60%)',
          filter: 'blur(80px)' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,255,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,184,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-14 relative">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', boxShadow: '0 0 24px rgba(0,255,184,0.5)' }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#020508' }}>PM</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Purple Merit</span>
        </div>

        {/* Hero text */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,255,184,0.1)', border: '1px solid rgba(0,255,184,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FFB8', boxShadow: '0 0 6px rgba(0,255,184,0.8)' }} />
            <span style={{ fontSize: 11, color: '#00FFB8', fontWeight: 600 }}>Enterprise User Management</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-2px' }}>
            Manage Users<br />
            <span style={{
              background: 'linear-gradient(135deg, #00FFB8 0%, #00C8FF 50%, #A855F7 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              With Precision
            </span>
          </h1>

          <p style={{ fontSize: 16, color: '#6B9BAA', lineHeight: 1.7, maxWidth: 400 }}>
            A powerful admin portal for managing users, roles, and permissions with full audit trails and real-time insights.
          </p>

          <div className="flex flex-wrap gap-2">
            {['Role-Based Access', 'JWT Auth', 'Audit Logs', 'Real-time'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(6,18,26,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#94B8C5' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-10">
          {[['1,248', 'Total Users'], ['3', 'Role Types'], ['24', 'Permissions']].map(([val, label]) => (
            <div key={label}>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{val}</p>
              <p style={{ fontSize: 12, color: '#6B9BAA', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <LoginForm />
      </div>
    </div>
  );
}
