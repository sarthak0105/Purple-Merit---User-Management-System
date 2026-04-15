'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Role } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { Search, Plus, Filter, ChevronDown, Edit2, Trash2, Eye, X, Shield, AlertTriangle } from 'lucide-react';

const roleStyle = (role: string) => {
  if (role === 'admin')   return { color: '#00FFB8', bg: 'rgba(0,255,184,0.12)',  border: 'rgba(0,255,184,0.25)'  };
  if (role === 'manager') return { color: '#00C8FF', bg: 'rgba(0,200,255,0.12)',  border: 'rgba(0,200,255,0.25)'  };
  return                         { color: '#A855F7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)' };
};

const statusStyle = (s: string) => {
  if (s === 'active')    return { dot: '#00FFB8', glow: '0 0 6px rgba(0,255,184,0.8)' };
  if (s === 'inactive')  return { dot: '#6B9BAA', glow: 'none' };
  if (s === 'suspended') return { dot: '#FF4757', glow: '0 0 6px rgba(255,71,87,0.8)' };
  return                        { dot: '#FFD93D', glow: '0 0 6px rgba(255,217,61,0.8)' };
};

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
  borderRadius: 10,
  color: '#fff',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  padding: '10px 12px',
  transition: 'all 0.2s',
};

// ── Edit User Modal ───────────────────────────────────────────────────────────
function EditUserModal({ user, roles, onClose, onSaved }: {
  user: User; roles: Role[];
  onClose: () => void;
  onSaved: (updated: User) => void;
}) {
  const [form, setForm] = useState({
    name:   user.name,
    email:  user.email,
    roleId: user.role?.id ?? '',
    status: user.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const roleAccent: Record<string, string> = { admin: '#00FFB8', manager: '#00C8FF', user: '#94B8C5' };

  const handleSave = async () => {
    setError('');
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setLoading(true);
    const res = await ApiClient.put(API_ENDPOINTS.USER(user.id), {
      name: form.name, email: form.email, role: form.roleId, status: form.status,
    });
    setLoading(false);
    if (!res.success) { setError(res.error || 'Update failed'); return; }
    onSaved(res.data as User);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #06121a 0%, #040e14 100%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#00FFB8,#00C8FF)', color: '#020508' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Edit User</p>
              <p style={{ fontSize: 11, color: '#6B9BAA' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ color: '#6B9BAA' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,184,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,184,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
          </div>

          {/* Role */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Role</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => {
                const color = roleAccent[r.name] ?? '#94B8C5';
                const isSel = form.roleId === r.id;
                return (
                  <button key={r.id} type="button" onClick={() => set('roleId', r.id)}
                    className="flex items-center gap-2 p-2.5 rounded-xl transition-all"
                    style={{ background: isSel ? `${color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${isSel ? color + '40' : 'rgba(255,255,255,0.08)'}` }}>
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: isSel ? '#fff' : '#94B8C5', textTransform: 'capitalize' }}>{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Status</label>
            <div className="flex gap-2">
              {[{ val: 'active', color: '#00FFB8', label: 'Active' }, { val: 'inactive', color: '#6B9BAA', label: 'Inactive' }, { val: 'suspended', color: '#FF4757', label: 'Suspended' }].map(s => (
                <button key={s.val} type="button" onClick={() => set('status', s.val)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all flex-1"
                  style={{ background: form.status === s.val ? `${s.color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${form.status === s.val ? s.color + '40' : 'rgba(255,255,255,0.08)'}` }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: form.status === s.val ? '#fff' : '#6B9BAA' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF4757' }} />{error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#00FFB8,#00C8FF)', color: '#020508', boxShadow: '0 0 20px rgba(0,255,184,0.3)' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onDeleted }: {
  user: User; onClose: () => void; onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    const res = await ApiClient.delete(API_ENDPOINTS.USER(user.id));
    setLoading(false);
    if (res.success) { onDeleted(user.id); onClose(); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ background: 'linear-gradient(135deg, #06121a 0%, #040e14 100%)', border: '1px solid rgba(255,71,87,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.3)' }}>
          <AlertTriangle className="w-6 h-6" style={{ color: '#FF4757' }} />
        </div>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Delete User?</p>
        <p style={{ fontSize: 13, color: '#6B9BAA', marginBottom: 24 }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>{user.name}</span> will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#FF4757,#ff6b6b)', color: '#fff', boxShadow: '0 0 20px rgba(255,71,87,0.3)' }}>
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
    ApiClient.get<Role[]>(API_ENDPOINTS.ROLES).then(r => {
      if (r.success && r.data) setRoles(r.data);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers(search, roleFilter, 1); }, 400);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const handleSaved = (updated: User) => {
    setUsers(u => u.map(x => x.id === updated.id ? updated : x));
    showToast('User updated successfully');
  };

  const handleDeleted = (id: string) => {
    setUsers(u => u.filter(x => x.id !== id));
    setTotal(t => t - 1);
    showToast('User deleted successfully');
  };

  const totalPages = Math.ceil(total / limit);
  const handlePage = (p: number) => { setPage(p); fetchUsers(search, roleFilter, p); };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
          style={{
            background: toast.type === 'success' ? 'rgba(0,255,184,0.15)' : 'rgba(255,71,87,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(0,255,184,0.35)' : 'rgba(255,71,87,0.35)'}`,
            backdropFilter: 'blur(16px)',
            color: toast.type === 'success' ? '#00FFB8' : '#FF4757',
          }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: toast.type === 'success' ? '#00FFB8' : '#FF4757' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{toast.msg}</span>
        </div>
      )}

      {/* Modals */}
      {editUser && <EditUserModal user={editUser} roles={roles} onClose={() => setEditUser(null)} onSaved={handleSaved} />}
      {deleteUser && <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onDeleted={handleDeleted} />}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 11, color: '#6B9BAA', fontWeight: 500 }}>User Management</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#00FFB8', boxShadow: '0 0 6px rgba(0,255,184,0.8)' }} />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(0,255,184,0.1)', color: '#00FFB8', border: '1px solid rgba(0,255,184,0.25)' }}>
              {total} Total
            </span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px' }}>Users</h1>
        </div>
        <Link href="/users/new">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', color: '#020508', boxShadow: '0 0 24px rgba(0,255,184,0.4), 0 4px 12px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            <Plus className="w-4 h-4" /> New User
          </button>
        </Link>
      </div>

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>

        {/* Toolbar */}
        <div className="p-4 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(4,14,20,0.8)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#6B9BAA' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="bg-transparent outline-none flex-1"
              style={{ fontSize: 13, color: '#fff' }} />
          </div>

          <div className="flex items-center gap-1">
            {['All', 'Admin', 'Manager', 'User'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={roleFilter === r
                  ? { background: 'rgba(0,255,184,0.12)', color: '#00FFB8', border: '1px solid rgba(0,255,184,0.28)' }
                  : { color: '#6B9BAA', border: '1px solid transparent' }}
                onMouseEnter={e => { if (roleFilter !== r) (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { if (roleFilter !== r) (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; }}>
                {r}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'rgba(4,14,20,0.8)', border: '1px solid rgba(255,255,255,0.09)', color: '#6B9BAA' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'; }}>
            <Filter className="w-3.5 h-3.5" /> Filter <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left"
                    style={{ fontSize: 10, fontWeight: 700, color: '#3A6070', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(0,255,184,0.06)', border: '1px solid rgba(0,255,184,0.12)' }}>
                        <Users className="w-7 h-7" style={{ color: '#3A6070' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                          {search || roleFilter !== 'All' ? 'No users match your search' : 'No users yet'}
                        </p>
                        <p style={{ fontSize: 13, color: '#6B9BAA' }}>
                          {search || roleFilter !== 'All'
                            ? 'Try adjusting your search or filter'
                            : 'Create your first user to get started'}
                        </p>
                      </div>
                      {!search && roleFilter === 'All' && (
                        <Link href="/users/new">
                          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                            style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', color: '#020508', boxShadow: '0 0 20px rgba(0,255,184,0.3)' }}>
                            <Plus className="w-4 h-4" /> Create First User
                          </button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const rs = roleStyle(u.role?.name);
                  const ss = statusStyle(u.status);
                  return (
                    <tr key={u.id} className="group transition-all cursor-pointer"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,184,0.025)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', color: '#020508', boxShadow: '0 0 10px rgba(0,255,184,0.3)' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5" style={{ fontSize: 13, color: '#6B9BAA' }}>{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ color: rs.color, background: rs.bg, border: `1px solid ${rs.border}` }}>
                          {u.role?.name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full"
                            style={{ background: ss.dot, boxShadow: ss.glow }} />
                          <span style={{ fontSize: 13, color: '#fff', textTransform: 'capitalize' }}>{u.status}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#6B9BAA' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/users/${u.id}`}>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                              style={{ color: '#6B9BAA' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00C8FF'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,200,255,0.1)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <button className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                            style={{ color: '#6B9BAA' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00FFB8'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,184,0.1)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            onClick={() => setEditUser(u)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteUser(u)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                            style={{ color: '#6B9BAA' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF4757'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,71,87,0.1)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 12, color: '#6B9BAA' }}>
              Showing {users.length} of {total} users
            </span>
            <div className="flex gap-1">
              <button onClick={() => handlePage(page - 1)} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                style={{ color: '#6B9BAA', border: '1px solid transparent' }}>
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => handlePage(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={p === page
                    ? { background: 'rgba(0,255,184,0.12)', color: '#00FFB8', border: '1px solid rgba(0,255,184,0.28)' }
                    : { color: '#6B9BAA', border: '1px solid transparent' }}>
                  {p}
                </button>
              ))}
              <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                style={{ color: '#6B9BAA', border: '1px solid transparent' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
