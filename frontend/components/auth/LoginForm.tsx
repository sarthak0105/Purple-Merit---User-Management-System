'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const demoUsers = [
    { label: 'Admin',   email: 'admin@example.com',   color: '#00FFB8' },
    { label: 'Manager', email: 'manager@example.com', color: '#00C8FF' },
    { label: 'User',    email: 'user@example.com',    color: '#94B8C5' },
  ];

  const inputStyle = {
    background: 'rgba(4,14,20,0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 14,
    borderRadius: 12,
    outline: 'none',
    transition: 'all 0.2s',
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(6,18,26,0.92) 0%, rgba(4,14,20,0.96) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>

        {/* Inner glow */}
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(0,255,184,0.12) 0%, transparent 65%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', boxShadow: '0 0 20px rgba(0,255,184,0.5)' }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#020508' }}>PM</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Purple Merit</span>
        </div>

        <div className="mb-7 relative">
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: '#6B9BAA' }}>Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {/* Email */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B9BAA' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                disabled={isLoading} placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-3"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,184,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B9BAA' }} />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                disabled={isLoading} placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,184,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#6B9BAA' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B9BAA')}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF4757' }} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{
              background: 'linear-gradient(135deg, #00FFB8, #00C8FF)',
              color: '#020508',
              boxShadow: '0 0 32px rgba(0,255,184,0.4), 0 4px 16px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => { if (!isLoading) { (e.currentTarget as HTMLElement).style.opacity = '0.9'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            {isLoading
              ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#020508', borderTopColor: 'transparent' }} />
              : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 pt-5 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#3A6070', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Quick Login — Demo Accounts
          </p>
          <div className="flex gap-2">
            {demoUsers.map(u => (
              <button key={u.label} onClick={() => { setEmail(u.email); setPassword('password123'); }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(4,14,20,0.8)', border: `1px solid ${u.color}25`, color: u.color }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${u.color}50`; (e.currentTarget as HTMLElement).style.background = `${u.color}10`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${u.color}25`; (e.currentTarget as HTMLElement).style.background = 'rgba(4,14,20,0.8)'; }}>
                {u.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 10, color: '#3A6070', marginTop: 8, textAlign: 'center' }}>
            Password: <span style={{ fontFamily: 'monospace', color: '#6B9BAA' }}>password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
