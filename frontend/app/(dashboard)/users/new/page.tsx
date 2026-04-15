'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, User, Mail, Lock, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(6,18,26,0.85) 0%, rgba(4,14,20,0.9) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(4,14,20,0.8)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  padding: '12px 12px 12px 42px',
  transition: 'all 0.2s',
};

export default function NewUserPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', roleId: '', status: 'active' });
  const [roles, setRoles]     = useState<Role[]>([]);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState('');
  const [success, setSuccess]  = useState(false);

  // Only admin can create users
  useEffect(() => {
    if (currentUser && currentUser.role?.name !== 'admin') {
      router.replace('/users');
    }
  }, [currentUser, router]);

  // Load roles for the dropdown
  useEffect(() => {
    ApiClient.get<Role[]>(API_ENDPOINTS.ROLES).then(r => {
      if (r.success && r.data) {
        setRoles(r.data);
        setForm(f => ({ ...f, roleId: r.data![0]?.id ?? '' }));
      }
    });
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.roleId) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    const res = await ApiClient.post(API_ENDPOINTS.USERS, {
      name:     form.name,
      email:    form.email,
      password: form.password,
      role:     form.roleId,
      status:   form.status,
    });
    setLoading(false);
    if (!res.success) { setError(res.error || 'Failed to create user'); return; }
    setSuccess(true);
    setTimeout(() => router.push('/users'), 1500);
  };

  const roleAccent: Record<string, string> = { admin: '#00FFB8', manager: '#00C8FF', user: '#94B8C5' };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(0,255,184,0.15)', border: '2px solid rgba(0,255,184,0.4)' }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: '#00FFB8' }} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>User Created!</p>
          <p style={{ fontSize: 13, color: '#6B9BAA' }}>Redirecting to users list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-5">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm transition-colors group"
        style={{ color: '#6B9BAA' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6B9BAA')}>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Users
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize: 11, color: '#6B9BAA', fontWeight: 500 }}>User Management</span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00FFB8' }} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px' }}>Create New User</h1>
      </div>

      {/* Form card */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        {/* Top accent */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #00FFB8, #00C8FF, transparent)' }} />

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B9BAA' }} />
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Jane Smith" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,184,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B9BAA' }} />
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="jane@example.com" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,184,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B9BAA' }} />
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Min. 6 characters" style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,184,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#6B9BAA' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B9BAA')}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => {
                const color = roleAccent[r.name] ?? '#94B8C5';
                const isSelected = form.roleId === r.id;
                return (
                  <button key={r.id} type="button" onClick={() => set('roleId', r.id)}
                    className="flex items-center gap-2.5 p-3 rounded-xl transition-all"
                    style={{
                      background: isSelected ? `${color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? color + '40' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: isSelected ? `0 0 16px ${color}20` : 'none',
                    }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                      <Shield className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div className="text-left">
                      <p style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#fff' : '#94B8C5', textTransform: 'capitalize' }}>{r.name}</p>
                      <p style={{ fontSize: 10, color: '#6B9BAA' }}>{r.permissions?.length ?? 0} perms</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Status
            </label>
            <div className="flex gap-2">
              {[
                { val: 'active',   color: '#00FFB8', label: 'Active'   },
                { val: 'inactive', color: '#6B9BAA', label: 'Inactive' },
              ].map(s => (
                <button key={s.val} type="button" onClick={() => set('status', s.val)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                  style={{
                    background: form.status === s.val ? `${s.color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.status === s.val ? s.color + '40' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: form.status === s.val ? '#fff' : '#6B9BAA' }}>{s.label}</span>
                </button>
              ))}
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

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', color: '#020508', boxShadow: '0 0 24px rgba(0,255,184,0.35)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#020508', borderTopColor: 'transparent' }} />
                  Creating...
                </span>
              ) : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
