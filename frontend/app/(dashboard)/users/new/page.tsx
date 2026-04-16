'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, User, Mail, Lock, Shield, UserCheck } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [form, setForm]       = useState({ name: '', email: '', password: '', roleId: '', status: 'active' });
  const [roles, setRoles]     = useState<Role[]>([]);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState('');
  const [success, setSuccess]  = useState(false);
  const [focused, setFocused]  = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.role?.name !== 'admin') router.replace('/users');
  }, [currentUser, router]);

  useEffect(() => {
    ApiClient.get<Role[]>(API_ENDPOINTS.ROLES).then(r => {
      if (r.success && r.data) { setRoles(r.data); setForm(f => ({ ...f, roleId: r.data![0]?.id ?? '' })); }
    });
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.roleId) { setError('All fields are required'); return; }
    setLoading(true);
    const res = await ApiClient.post(API_ENDPOINTS.USERS, {
      name: form.name, email: form.email, password: form.password, role: form.roleId, status: form.status,
    });
    setLoading(false);
    if (!res.success) { setError(res.error || 'Failed to create user'); return; }
    setSuccess(true);
    setTimeout(() => router.push('/users'), 1500);
  };

  const roleColors: Record<string, { active: string; dot: string }> = {
    admin:   { active: 'border-purple-500/60 bg-purple-500/10 text-purple-300', dot: 'bg-purple-400' },
    manager: { active: 'border-blue-500/60 bg-blue-500/10 text-blue-300',       dot: 'bg-blue-400'   },
    user:    { active: 'border-gray-500/60 bg-gray-500/10 text-gray-300',        dot: 'bg-gray-400'   },
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <div className="relative w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">User Created!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Redirecting to users list...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Users
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] flex items-center justify-center flex-shrink-0">
          <UserCheck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Create New User</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Add a new user to the system.</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-2xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden shadow-sm">

        {/* Top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-[#2F2F35] to-transparent" />

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused === 'name' ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`} />
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                placeholder="e.g. Jane Smith"
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all ${
                  focused === 'name'
                    ? 'bg-gray-50 dark:bg-[#1F1F23] border border-gray-400 dark:border-[#3F3F45] ring-2 ring-gray-200 dark:ring-[#2F2F35]'
                    : 'bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] hover:border-gray-300 dark:hover:border-[#3F3F45]'
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused === 'email' ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`} />
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="jane@example.com"
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all ${
                  focused === 'email'
                    ? 'bg-gray-50 dark:bg-[#1F1F23] border border-gray-400 dark:border-[#3F3F45] ring-2 ring-gray-200 dark:ring-[#2F2F35]'
                    : 'bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] hover:border-gray-300 dark:hover:border-[#3F3F45]'
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focused === 'password' ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`} />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Min. 6 characters"
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all ${
                  focused === 'password'
                    ? 'bg-gray-50 dark:bg-[#1F1F23] border border-gray-400 dark:border-[#3F3F45] ring-2 ring-gray-200 dark:ring-[#2F2F35]'
                    : 'bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] hover:border-gray-300 dark:hover:border-[#3F3F45]'
                }`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-[#1F1F23]" />

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => {
                const rc = roleColors[r.name] ?? roleColors.user;
                const isSelected = form.roleId === r.id;
                return (
                  <button key={r.id} type="button" onClick={() => set('roleId', r.id)}
                    className={`relative flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? rc.active
                        : 'border-gray-200 dark:border-[#2F2F35] bg-gray-50 dark:bg-[#1F1F23] text-gray-500 dark:text-gray-500 hover:border-gray-300 dark:hover:border-[#3F3F45] hover:text-gray-700 dark:hover:text-gray-300'
                    }`}>
                    {isSelected && (
                      <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                    )}
                    <Shield className="h-4 w-4 mb-1.5 opacity-70" />
                    <span className="text-xs font-semibold capitalize">{r.name}</span>
                    <span className="text-[10px] opacity-60 mt-0.5">{r.permissions?.length ?? 0} perms</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'active',   label: 'Active',   dot: 'bg-green-500' },
                { val: 'inactive', label: 'Inactive', dot: 'bg-gray-400'  },
              ].map(s => (
                <button key={s.val} type="button" onClick={() => set('status', s.val)}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                    form.status === s.val
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'border-gray-200 dark:border-[#2F2F35] bg-gray-50 dark:bg-[#1F1F23] text-gray-500 dark:text-gray-500 hover:border-gray-300 dark:hover:border-[#3F3F45]'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.status === s.val ? 'bg-current' : s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 shadow-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-900 border-t-transparent animate-spin" />
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
