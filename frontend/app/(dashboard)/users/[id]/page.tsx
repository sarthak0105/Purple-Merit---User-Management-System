'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Role } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft, Mail, Shield, Calendar, Clock,
  Edit2, Trash2, Check, Activity, X,
  AlertTriangle, CheckCircle2,
} from 'lucide-react';

const roleColor = (r: string) => {
  if (r === 'admin')   return { color: '#00FFB8', bg: 'rgba(0,255,184,0.1)',    border: 'rgba(0,255,184,0.25)'   };
  if (r === 'manager') return { color: '#00C8FF', bg: 'rgba(0,200,255,0.1)',    border: 'rgba(0,200,255,0.25)'   };
  return                      { color: '#A855F7', bg: 'rgba(168,85,247,0.1)',   border: 'rgba(168,85,247,0.25)'  };
};

const statusColor = (s: string) => {
  if (s === 'active')   return { dot: '#00FFB8', text: '#00FFB8', bg: 'rgba(0,255,184,0.1)',  border: 'rgba(0,255,184,0.25)'  };
  if (s === 'inactive') return { dot: '#6B9BAA', text: '#6B9BAA', bg: 'rgba(107,155,170,0.1)', border: 'rgba(107,155,170,0.2)' };
  return                       { dot: '#FF4757', text: '#FF4757', bg: 'rgba(255,71,87,0.1)',   border: 'rgba(255,71,87,0.25)'  };
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
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [editName,   setEditName]   = useState('');
  const [editEmail,  setEditEmail]  = useState('');
  const [editRole,   setEditRole]   = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError,   setEditError]   = useState('');

  const isAdmin   = currentUser?.role?.name === 'admin';
  const isManager = currentUser?.role?.name === 'manager';

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    Promise.all([
      ApiClient.get<User>(API_ENDPOINTS.USER(userId)),
      ApiClient.get<Role[]>(API_ENDPOINTS.ROLES),
    ]).then(([ur, rr]) => {
      if (ur.success && ur.data) {
        setUser(ur.data);
        setEditName(ur.data.name);
        setEditEmail(ur.data.email);
        setEditRole(ur.data.role?.id ?? '');
        setEditStatus(ur.data.status);
      }
      if (rr.success && rr.data) setRoles(rr.data);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleEditSave = async () => {
    setEditError('');
    if (!editName || !editEmail) { setEditError('Name and email are required'); return; }
    setEditLoading(true);
    const res = await ApiClient.put(API_ENDPOINTS.USER(userId), {
      name: editName, email: editEmail, role: editRole, status: editStatus,
    });
    setEditLoading(false);
    if (!res.success) { setEditError(res.error || 'Update failed'); return; }
    setUser(res.data as User);
    setShowEdit(false);
    showToast('User updated successfully');
  };

  const handleDelete = async () => {
    const res = await ApiClient.delete(API_ENDPOINTS.USER(userId));
    if (res.success) { router.push('/users'); }
    else showToast('Failed to delete user', 'error');
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-48 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#6B9BAA' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="rounded-2xl p-12 text-center" style={{ ...cardStyle, border: '1px solid rgba(255,71,87,0.2)' }}>
          <p style={{ color: '#FF4757', fontWeight: 600 }}>User not found</p>
        </div>
      </div>
    );
  }

  const rc = roleColor(user.role?.name);
  const sc = statusColor(user.status);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
          style={{ background: toast.type === 'success' ? 'rgba(0,255,184,0.15)' : 'rgba(255,71,87,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(0,255,184,0.35)' : 'rgba(255,71,87,0.35)'}`, backdropFilter: 'blur(16px)', color: toast.type === 'success' ? '#00FFB8' : '#FF4757' }}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span style={{ fontSize: 13, fontWeight: 600 }}>{toast.msg}</span>
        </div>
      )}

      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm transition-colors group"
        style={{ color: '#6B9BAA' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6B9BAA')}>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Users
      </button>

      {/* Profile Hero */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${rc.color}, #00C8FF, transparent)` }} />
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ background: `linear-gradient(135deg, ${rc.color}, #00C8FF)`, color: '#020508', boxShadow: `0 0 24px ${rc.color}40` }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                style={{ background: sc.dot, borderColor: '#06121a', boxShadow: `0 0 8px ${sc.dot}80` }} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>{user.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                  style={{ color: rc.color, background: rc.bg, border: `1px solid ${rc.border}` }}>
                  {user.role?.name}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                  style={{ color: sc.text, background: sc.bg, border: `1px solid ${sc.border}` }}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions — admin only */}
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setShowEdit(!showEdit)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: `linear-gradient(135deg, ${rc.color}, #00C8FF)`, color: '#020508', boxShadow: `0 0 16px ${rc.color}35` }}>
                <Edit2 className="w-3.5 h-3.5" /> {showEdit ? 'Cancel' : 'Edit'}
              </button>
              <button onClick={() => setShowDel(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,71,87,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,71,87,0.1)')}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* ── Inline Edit Form ── */}
        {showEdit && isAdmin && (
          <div className="px-6 pb-6 pt-2 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', paddingTop: 8 }}>Edit User Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = `${rc.color}50`; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = `${rc.color}50`; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Role</label>
                <div className="flex gap-2">
                  {roles.map(r => {
                    const rc2 = roleColor(r.name);
                    const sel = editRole === r.id;
                    return (
                      <button key={r.id} type="button" onClick={() => setEditRole(r.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all text-xs font-semibold capitalize"
                        style={{ background: sel ? `${rc2.color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${sel ? rc2.color + '40' : 'rgba(255,255,255,0.08)'}`, color: sel ? rc2.color : '#6B9BAA' }}>
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Status</label>
                <div className="flex gap-2">
                  {[{ val: 'active', color: '#00FFB8' }, { val: 'inactive', color: '#6B9BAA' }, { val: 'suspended', color: '#FF4757' }].map(s => (
                    <button key={s.val} type="button" onClick={() => setEditStatus(s.val)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl transition-all text-xs font-semibold capitalize"
                      style={{ background: editStatus === s.val ? `${s.color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${editStatus === s.val ? s.color + '40' : 'rgba(255,255,255,0.08)'}`, color: editStatus === s.val ? s.color : '#6B9BAA' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                      {s.val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {editError && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757' }}>
                <X className="w-3.5 h-3.5 flex-shrink-0" />{editError}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}>
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${rc.color}, #00C8FF)`, color: '#020508', boxShadow: `0 0 20px ${rc.color}30` }}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDel(false); }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg, #06121a 0%, #040e14 100%)', border: '1px solid rgba(255,71,87,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.3)' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: '#FF4757' }} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Delete User?</p>
            <p style={{ fontSize: 13, color: '#6B9BAA', marginBottom: 24 }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>{user.name}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDel(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}>
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#FF4757,#ff6b6b)', color: '#fff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info + Permissions row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Mail,     label: 'Email',        value: user.email,  color: '#00C8FF' },
            { icon: Calendar, label: 'Joined',        value: new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), color: '#00FFB8' },
            { icon: Clock,    label: 'Last Updated',  value: new Date(user.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), color: '#FF2D6F' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl p-4" style={cardStyle}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '15' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }} className="break-all">{value}</p>
            </div>
          ))}

          {/* Permissions */}
          <div className="sm:col-span-3 rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4" style={{ color: rc.color }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Permissions</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto"
                style={{ color: rc.color, background: rc.bg, border: `1px solid ${rc.border}` }}>
                {user.role?.permissions?.length ?? 0} granted
              </span>
            </div>
            {user.role?.permissions?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {user.role.permissions.map(p => (
                  <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-xl"
                    style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: rc.color }}>
                      <Check className="w-2.5 h-2.5" style={{ color: '#020508' }} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{p.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#6B9BAA' }}>No permissions assigned</p>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4" style={{ color: rc.color }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Account Timeline</h3>
          </div>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            {[
              { event: 'Account created',       time: new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), active: false },
              { event: `Role: ${user.role?.name}`, time: 'Assigned on creation', active: false },
              { event: `Status: ${user.status}`,   time: new Date(user.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), active: true },
            ].map((item, i) => (
              <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 z-10"
                  style={{ background: item.active ? rc.color : 'rgba(255,255,255,0.1)', border: `2px solid ${item.active ? rc.color : 'rgba(255,255,255,0.15)'}`, boxShadow: item.active ? `0 0 8px ${rc.color}60` : 'none' }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{item.event}</p>
                  <p style={{ fontSize: 10, color: '#6B9BAA', marginTop: 2 }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
