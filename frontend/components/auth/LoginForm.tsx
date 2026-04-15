'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email,    setEmail]    = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [focused,  setFocused]  = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  // Subtle 3D tilt on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -4;
    const rotY = ((x - cx) / cx) * 4;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  const demoUsers = [
    { label: 'Admin',   email: 'admin@example.com',   role: 'Full access' },
    { label: 'Manager', email: 'manager@example.com', role: 'View & edit' },
    { label: 'User',    email: 'user@example.com',    role: 'Dashboard' },
  ];

  const inputCls = (field: string) =>
    `w-full pl-10 pr-4 py-3 text-sm rounded-xl text-white placeholder-zinc-600 outline-none transition-all duration-200 ${
      focused === field
        ? 'bg-zinc-800 border border-zinc-600 shadow-[0_0_0_3px_rgba(255,255,255,0.06)]'
        : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
    } disabled:opacity-50`;

  return (
    <div className="w-full max-w-sm" style={{ animation: 'fadeUp 0.5s ease-out both' }}>

      {/* Logo + brand */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-3 shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:scale-105"
        >
          <span className="text-zinc-950 font-black text-base tracking-tight">PM</span>
        </div>
        <span className="text-base font-semibold text-white">Purple Merit</span>
        <span className="text-xs text-zinc-500 mt-0.5">User Management Portal</span>
      </div>

      {/* Card with 3D tilt */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(39,39,42,0.9) 0%, rgba(24,24,27,0.95) 100%)',
          border: '1px solid rgba(63,63,70,0.8)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset',
          transition: 'transform 0.15s ease-out',
          willChange: 'transform',
        }}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

        <div className="p-7">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Welcome back</h2>
            <p className="text-sm text-zinc-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${focused === 'email' ? 'text-zinc-300' : 'text-zinc-600'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  placeholder="you@example.com"
                  className={inputCls('email')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${focused === 'password' ? 'text-zinc-300' : 'text-zinc-600'}`} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`${inputCls('password')} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              style={{
                background: 'white',
                color: '#09090b',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.3), 0 4px 16px rgba(255,255,255,0.12)',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(255,255,255,0.4), 0 8px 24px rgba(255,255,255,0.18)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(255,255,255,0.3), 0 4px 16px rgba(255,255,255,0.12)';
              }}
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
              ) : (
                <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(63,63,70,0.6)' }}>
            <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold mb-3 text-center">
              Demo accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoUsers.map(u => (
                <button
                  key={u.label}
                  onClick={() => { setEmail(u.email); setPassword('password123'); }}
                  className="group flex flex-col items-center py-2.5 px-2 rounded-xl transition-all duration-200"
                  style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(63,63,70,0.6)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,113,122,0.8)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(39,39,42,0.8)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(63,63,70,0.6)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(24,24,27,0.8)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <span className="text-xs font-semibold text-zinc-300">{u.label}</span>
                  <span className="text-[10px] text-zinc-600 mt-0.5">{u.role}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-700 mt-3 text-center">
              Password: <span className="font-mono text-zinc-500">password123</span>
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <p className="text-center mt-5">
        <Link href="/"
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-200 inline-flex items-center gap-1">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
