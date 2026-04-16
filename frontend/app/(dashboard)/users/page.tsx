'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Role } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { Search, Plus, Filter, Edit2, Trash2, Eye, X, Shield, AlertTriangle, ChevronDown } from 'lucide-react';

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

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditUserModal({ user, roles, onClose, onSaved }: {
  user: User; roles: Role[]; onClose: () => void; onSaved: (u: User) => void;
}) {
  const [form, setForm] = useState({ name: user.name, email: user.email, roleId: user.role?.id ?? '', status: user.status });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError('');
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setLoading(true);
    const res = await ApiClient.put(API_ENDPOINTS.USER(user.id), { name: form.name, email: form.email, role: form.roleId, status: form.status });
    setLoading(false);
    if (!res.success) { setError(res.error || 'Update failed'); return; }
    onSaved(res.data as User);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-enter w-full max-w-md bg-white dark:bg-[#1F1F23] rounded-xl border border-gray-200 dark:border-[#2F2F35] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2F2F35]">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Edit User</h3>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2F2F35] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {[{ label: 'Full Name', key: 'name', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
            <div className="flex gap-2">
              {roles.map(r => (
                <button key={r.id} type="button" onClick={() => set('roleId', r.id)}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition-colors capitalize ${form.roleId === r.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-[#0F0F12] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2F2F35] hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <div className="flex gap-2">
              {['active', 'inactive', 'suspended'].map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition-colors capitalize ${form.status === s ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-[#0F0F12] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2F2F35] hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="flex-1 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onDeleted }: { user: User; onClose: () => void; onDeleted: (id: string) => void; }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    const res = await ApiClient.delete(API_ENDPOINTS.USER(user.id));
    setLoading(false);
    if (res.success) { onDeleted(user.id); onClose(); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-enter w-full max-w-sm bg-white dark:bg-[#1F1F23] rounded-xl border border-gray-200 dark:border-[#2F2F35] shadow-xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Delete User?</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 transition-colors">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.name === 'admin';

  const [users, setUsers]           = useState<User[]>([]);
  const [roles, setRoles]           = useState<Role[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage]             = useState(1);
  const [editUser, setEditUser]     = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const limit = 10;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async (s = search, r = roleFilter, p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (s) params.set('search', s);
    if (r !== 'All') params.set('role', r.toLowerCase());
    const res = await ApiClient.get<User[]>(`${API_ENDPOINTS.USERS}?${params}`);
    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data);
      setTotal((res as any).total ?? res.data.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    ApiClient.get<Role[]>(API_ENDPOINTS.ROLES).then(r => { if (r.success && r.data) setRoles(r.data); });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers(search, roleFilter, 1); }, 400);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const handleSaved = (updated: User) => { setUsers(u => u.map(x => x.id === updated.id ? updated : x)); showToast('User updated'); };
  const handleDeleted = (id: string) => { setUsers(u => u.filter(x => x.id !== id)); setTotal(t => t - 1); showToast('User deleted'); };
  const totalPages = Math.ceil(total / limit);
  const handlePage = (p: number) => { setPage(p); fetchUsers(search, roleFilter, p); };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          {toast.msg}
        </div>
      )}

      {editUser && <EditUserModal user={editUser} roles={roles} onClose={() => setEditUser(null)} onSaved={handleSaved} />}
      {deleteUser && <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onDeleted={handleDeleted} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{total} total users</p>
        </div>
        {isAdmin && (
          <Link href="/users/new">
            <button className="btn-depth flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
              <Plus className="h-4 w-4" />
              New User
            </button>
          </Link>
        )}
      </div>

      {/* Table card */}
      <div className="card-depth bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-[#1F1F23] flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] rounded-md text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-all" />
          </div>
          <div className="flex items-center gap-1">
            {['All', 'Admin', 'Manager', 'User'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${roleFilter === r ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23]'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#1F1F23]">
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 dark:bg-[#1F1F23] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-[#1F1F23] rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {search || roleFilter !== 'All' ? 'No users match your search' : 'No users yet'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {search || roleFilter !== 'All' ? 'Try adjusting your filters' : 'Create your first user to get started'}
                      </p>
                      {!search && roleFilter === 'All' && isAdmin && (
                        <Link href="/users/new">
                          <button className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
                            <Plus className="h-3.5 w-3.5" /> Create User
                          </button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="row-hover hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-semibold">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadge(u.role?.name)}`}>
                        {u.role?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-100 transition-opacity">
                        <Link href={`/users/${u.id}`}>
                          <button className="p-1.5 rounded text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        {isAdmin && (
                          <>
                            <button onClick={() => setEditUser(u)} className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2F2F35] transition-colors">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteUser(u)} className="p-1.5 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-[#1F1F23] flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">Showing {users.length} of {total} users</p>
            <div className="flex gap-1">
              <button onClick={() => handlePage(page - 1)} disabled={page === 1}
                className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-[#2F2F35] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23] disabled:opacity-40 transition-colors">
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => handlePage(p)}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${p === page ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-200 dark:border-[#2F2F35] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23]'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-[#2F2F35] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23] disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fix missing import
function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
