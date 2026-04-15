'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Role } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Mail, Shield, Calendar, Clock, Edit2, Trash2, Check, Activity, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

const roleBadge = (r: string) => {
  if (r === 'admin')   return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  if (r === 'manager') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
};

const statusBadge = (s: string) => {
  if (s === 'active')    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (s === 'inactive')  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  if (s === 'suspended') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
};

export default function UserDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const { user: currentUser } = useAuth();
  const userId  = params.id as string;

  const [user, setUser]         = useState<User | null>(null);
  const [roles, setRoles]       = useState<Role[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel,  setShowDel]  = useState(false);
  const [toast, setToast]       = useState<string | null>(null);

  const [editName,   setEditName]   = useState('');
  const [editEmail,  setEditEmail]  = useState('');
  const [editRole,   setEditRole]   = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError,   setEditError]   = useState('');

  const isAdmin = currentUser?.role?.name === 'admin';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    Promise.all([ApiClient.get<User>(API_ENDPOINTS.USER(userId)), ApiClient.get<Role[]>(API_ENDPOINTS.ROLES)])
      .then(([ur, rr]) => {
        if (ur.success && ur.data) { setUser(ur.data); setEditName(ur.data.name); setEditEmail(ur.data.email); setEditRole(ur.data.role?.id ?? ''); setEditStatus(ur.data.status); }
        if (rr.success && rr.data) setRoles(rr.data);
      }).finally(() => setLoading(false));
  }, [userId]);

  const handleEditSave = async () => {
    setEditError('');
    if (!editName || !editEmail) { setEditError('Name and email are required'); return; }
    setEditLoading(true);
    const res = await ApiClient.put(API_ENDPOINTS.USER(userId), { name: editName, email: editEmail, role: editRole, status: editStatus });
    setEditLoading(false);
    if (!res.success) { setEditError(res.error || 'Update failed'); return; }
    setUser(res.data as User); setShowEdit(false); showToast('User updated successfully');
  };

  const handleDelete = async () => {
    const res = await ApiClient.delete(API_ENDPOINTS.USER(userId));
    if (res.success) router.push('/users');
    else showToast('Failed to delete user');
  };

  const inputCls = "w-full px-3 py-2 text-sm bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-all";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-100 dark:bg-[#1F1F23] rounded" />
        <div className="h-40 bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-red-200 dark:border-red-800 p-12 text-center">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Delete modal */}
      {showDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => { if (e.target === e.currentTarget) setShowDel(false); }}>
          <div className="w-full max-w-sm bg-white dark:bg-[#1F1F23] rounded-xl border border-gray-200 dark:border-[#2F2F35] shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Delete User?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6"><span className="font-medium text-gray-900 dark:text-white">{user.name}</span> will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDel(false)} className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Users
      </button>

      {/* Profile card */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadge(user.role?.name)}`}>{user.role?.name}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(user.status)}`}>{user.status}</span>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setShowEdit(!showEdit)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors">
                <Edit2 className="h-3.5 w-3.5" /> {showEdit ? 'Cancel' : 'Edit'}
              </button>
              <button onClick={() => setShowDel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-[#1F1F23] border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Inline edit form */}
        {showEdit && isAdmin && (
          <div className="px-6 pb-6 pt-0 space-y-4 border-t border-gray-100 dark:border-[#1F1F23] pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Edit User Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                <div className="flex gap-1.5">
                  {roles.map(r => (
                    <button key={r.id} type="button" onClick={() => setEditRole(r.id)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors capitalize ${editRole === r.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-[#0F0F12] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2F2F35] hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}>
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <div className="flex gap-1.5">
                  {['active', 'inactive', 'suspended'].map(s => (
                    <button key={s} type="button" onClick={() => setEditStatus(s)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors capitalize ${editStatus === s ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-[#0F0F12] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2F2F35] hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {editError && <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowEdit(false)} className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">Cancel</button>
              <button onClick={handleEditSave} disabled={editLoading} className="flex-1 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors">
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Info cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Mail,     label: 'Email',       value: user.email,  },
              { icon: Calendar, label: 'Joined',       value: new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
              { icon: Clock,    label: 'Last Updated', value: new Date(user.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{value}</p>
              </div>
            ))}
          </div>

          {/* Permissions */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Permissions</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{user.role?.permissions?.length ?? 0} granted</span>
            </div>
            {user.role?.permissions?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {user.role.permissions.map(p => (
                  <div key={p.id} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-[#1F1F23] rounded-md border border-gray-200 dark:border-[#2F2F35]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{p.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No permissions assigned</p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Account Timeline</h3>
          </div>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200 dark:bg-[#2F2F35]" />
            {[
              { event: 'Account created',          time: new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), active: false },
              { event: `Role: ${user.role?.name}`, time: 'Assigned on creation', active: false },
              { event: `Status: ${user.status}`,   time: new Date(user.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), active: true },
            ].map((item, i) => (
              <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 z-10 border-2 ${item.active ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white' : 'bg-white dark:bg-[#0F0F12] border-gray-300 dark:border-[#2F2F35]'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{item.event}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
