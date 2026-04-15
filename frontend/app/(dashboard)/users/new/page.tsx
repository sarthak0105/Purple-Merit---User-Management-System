'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', roleId: '', status: 'active' });
  const [roles, setRoles]     = useState<Role[]>([]);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState('');
  const [success, setSuccess]  = useState(false);

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
    const res = await ApiClient.post(API_ENDPOINTS.USERS, { name: form.name, email: form.email, password: form.password, role: form.roleId, status: form.status });
    setLoading(false);
    if (!res.success) { setError(res.error || 'Failed to create user'); return; }
    setSuccess(true);
    setTimeout(() => router.push('/users'), 1500);
  };

  const inputCls = "w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2F2F35] rounded-md text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-all";

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">User Created!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to users list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Users
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New User</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add a new user to the system.</p>
      </div>

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Jane Smith" className={inputCls} />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" className={inputCls} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button key={r.id} type="button" onClick={() => set('roleId', r.id)}
                  className={`py-2.5 px-3 text-sm font-medium rounded-md border transition-colors capitalize ${form.roleId === r.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-[#1F1F23] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2F2F35] hover:bg-gray-50 dark:hover:bg-[#2F2F35]'}`}>
                  {r.name}
                  <span className="block text-xs font-normal opacity-60 mt-0.5">{r.permissions?.length ?? 0} perms</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <div className="flex gap-2">
              {[{ val: 'active', label: 'Active' }, { val: 'inactive', label: 'Inactive' }].map(s => (
                <button key={s.val} type="button" onClick={() => set('status', s.val)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md border transition-colors ${form.status === s.val ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-[#1F1F23] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2F2F35] hover:bg-gray-50 dark:hover:bg-[#2F2F35]'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
