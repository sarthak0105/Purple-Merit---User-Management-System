'use client';

import { useState, useEffect } from 'react';
import { Role, Permission } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, Users, Shield, ChevronRight, Check, Lock, X, AlertTriangle } from 'lucide-react';

const roleAccent: Record<string, { color: string; bg: string }> = {
  admin:   { color: '#00FFB8', bg: 'rgba(0,255,184,0.08)'  },
  manager: { color: '#00C8FF', bg: 'rgba(0,200,255,0.08)'  },
  user:    { color: '#FF2D6F', bg: 'rgba(255,45,111,0.08)' },
};

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(6,18,26,0.85) 0%, rgba(4,14,20,0.9) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
};

// ── Role Form Modal (Create + Edit) ───────────────────────────────────────────
function RoleModal({ role, permissions, onClose, onSaved }: {
  role: Role | null;
  permissions: Permission[];
  onClose: () => void;
  onSaved: (r: Role) => void;
}) {
  const isEdit = !!role;
  const [name, setName]           = useState(role?.name ?? '');
  const [desc, setDesc]           = useState(role?.description ?? '');
  const [selected, setSelected]   = useState<Set<string>>(
    new Set(role?.permissions?.map(p => p.id) ?? [])
  );
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const togglePerm = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) { setError('Role name is required'); return; }
    if (!desc.trim()) { setError('Description is required'); return; }
    setLoading(true);
    const body = { name: name.trim(), description: desc.trim(), permissions: Array.from(selected) };
    const res = isEdit
      ? await ApiClient.put(API_ENDPOINTS.ROLE(role!.id), body)
      : await ApiClient.post(API_ENDPOINTS.ROLES, body);
    setLoading(false);
    if (!res.success) { setError(res.error || 'Failed to save role'); return; }
    onSaved(res.data as Role);
    onClose();
  };

  // Group permissions by category
  const grouped = permissions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #06121a 0%, #040e14 100%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,255,184,0.15)', border: '1px solid rgba(0,255,184,0.3)' }}>
              <Shield className="w-4 h-4" style={{ color: '#00FFB8' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{isEdit ? 'Edit Role' : 'Create New Role'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ color: '#6B9BAA' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Role Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. auditor"
              style={{ background: 'rgba(4,14,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', width: '100%', padding: '10px 12px' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what this role can do..." rows={2}
              style={{ background: 'rgba(4,14,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', width: '100%', padding: '10px 12px', resize: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,255,184,0.4)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Permissions</label>
              <span style={{ fontSize: 11, color: '#00FFB8' }}>{selected.size} selected</span>
            </div>
            <div className="space-y-3">
              {Object.entries(grouped).map(([cat, perms]) => (
                <div key={cat}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#3A6070', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{cat}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {perms.map(p => {
                      const on = selected.has(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => togglePerm(p.id)}
                          className="flex items-center gap-2 p-2.5 rounded-xl transition-all text-left"
                          style={{ background: on ? 'rgba(0,255,184,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${on ? 'rgba(0,255,184,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                          <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                            style={{ background: on ? '#00FFB8' : 'rgba(255,255,255,0.06)', border: `1px solid ${on ? '#00FFB8' : 'rgba(255,255,255,0.1)'}` }}>
                            {on && <Check className="w-2.5 h-2.5" style={{ color: '#020508' }} strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 500, color: on ? '#fff' : '#6B9BAA' }}>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF4757' }} />{error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#00FFB8,#00C8FF)', color: '#020508', boxShadow: '0 0 20px rgba(0,255,184,0.3)' }}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Role Modal ─────────────────────────────────────────────────────────
function DeleteRoleModal({ role, onClose, onDeleted }: {
  role: Role; onClose: () => void; onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const handleDelete = async () => {
    setLoading(true);
    const res = await ApiClient.delete(API_ENDPOINTS.ROLE(role.id));
    setLoading(false);
    if (!res.success) { setError(res.error || 'Cannot delete role'); return; }
    onDeleted(role.id); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ background: 'linear-gradient(135deg, #06121a 0%, #040e14 100%)', border: '1px solid rgba(255,71,87,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.3)' }}>
          <AlertTriangle className="w-6 h-6" style={{ color: '#FF4757' }} />
        </div>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Delete Role?</p>
        <p style={{ fontSize: 13, color: '#6B9BAA', marginBottom: 8 }}>
          <span style={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}>{role.name}</span> role will be permanently removed.
        </p>
        {role.userCount > 0 && (
          <p style={{ fontSize: 12, color: '#FF4757', marginBottom: 16 }}>
            ⚠ {role.userCount} user(s) are assigned to this role.
          </p>
        )}
        {error && <p style={{ fontSize: 12, color: '#FF4757', marginBottom: 12 }}>{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading || role.userCount > 0} className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#FF4757,#ff6b6b)', color: '#fff' }}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RolesPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.name === 'admin';

  const [roles, setRoles]           = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Role | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editRole, setEditRole]     = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadRoles = async () => {
    const r = await ApiClient.get<Role[]>(API_ENDPOINTS.ROLES);
    if (r.success && r.data && Array.isArray(r.data)) {
      const visible = isAdmin ? r.data : r.data.filter(role => role.name === currentUser?.role?.name);
      setRoles(visible);
      setSelected(prev => visible.find(x => x.id === prev?.id) ?? visible[0] ?? null);
    }
  };

  useEffect(() => {
    Promise.all([
      ApiClient.get<Role[]>(API_ENDPOINTS.ROLES),
      ApiClient.get<Permission[]>(API_ENDPOINTS.PERMISSIONS),
    ]).then(([r, p]) => {
      if (r.success && r.data) {
        const visible = isAdmin ? r.data : r.data.filter(role => role.name === currentUser?.role?.name);
        setRoles(visible);
        setSelected(visible[0] ?? null);
      }
      if (p.success && p.data) setPermissions(p.data);
    }).finally(() => setLoading(false));
  }, [isAdmin, currentUser]);

  const handleRoleSaved = (saved: Role) => {
    loadRoles();
    showToast(editRole ? 'Role updated successfully' : 'Role created successfully');
    setEditRole(null);
    setShowCreate(false);
  };

  const handleRoleDeleted = (id: string) => {
    setRoles(r => r.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
    showToast('Role deleted successfully');
  };

  const accent = selected ? (roleAccent[selected.name.toLowerCase()] ?? { color: '#94B8C5', bg: 'rgba(148,184,197,0.08)' }) : { color: '#00FFB8', bg: 'rgba(0,255,184,0.08)' };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
          style={{ background: toast.type === 'success' ? 'rgba(0,255,184,0.15)' : 'rgba(255,71,87,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(0,255,184,0.35)' : 'rgba(255,71,87,0.35)'}`, backdropFilter: 'blur(16px)', color: toast.type === 'success' ? '#00FFB8' : '#FF4757' }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: toast.type === 'success' ? '#00FFB8' : '#FF4757' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{toast.msg}</span>
        </div>
      )}

      {/* Modals */}
      {(showCreate || editRole) && (
        <RoleModal
          role={editRole}
          permissions={permissions}
          onClose={() => { setShowCreate(false); setEditRole(null); }}
          onSaved={handleRoleSaved}
        />
      )}
      {deleteRole && (
        <DeleteRoleModal role={deleteRole} onClose={() => setDeleteRole(null)} onDeleted={handleRoleDeleted} />
      )}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 11, color: '#6B9BAA', fontWeight: 500 }}>Access Control</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#00FFB8', boxShadow: '0 0 6px rgba(0,255,184,0.8)' }} />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(0,255,184,0.1)', color: '#00FFB8', border: '1px solid rgba(0,255,184,0.25)' }}>
              {roles.length} Roles
            </span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px' }}>Roles & Permissions</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', color: '#020508', boxShadow: '0 0 24px rgba(0,255,184,0.4), 0 4px 12px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            <Plus className="w-4 h-4" /> New Role
          </button>
        )}
      </div>

      <div className="flex gap-5">
        {/* Left — Role cards */}
        <div className="w-68 flex-shrink-0 space-y-3" style={{ width: 260 }}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ ...cardStyle, boxShadow: 'none' }} />
            ))
          ) : roles.map(role => {
            const ac = roleAccent[role.name] ?? roleAccent['User'];
            const isSelected = selected?.id === role.id;
            return (
              <div key={role.id} onClick={() => setSelected(role)}
                className="relative rounded-2xl cursor-pointer overflow-hidden group transition-all duration-200"
                style={{
                  ...cardStyle,
                  border: `1px solid ${isSelected ? ac.color + '40' : 'rgba(255,255,255,0.09)'}`,
                  boxShadow: isSelected
                    ? `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${ac.color}18, inset 0 1px 0 rgba(255,255,255,0.07)`
                    : '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
                }}>
                {/* Top accent line when selected */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${ac.color}90, transparent)` }} />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: ac.bg, border: `1px solid ${ac.color}25` }}>
                        <Shield className="w-4 h-4" style={{ color: ac.color }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{role.name}</p>
                        <p style={{ fontSize: 11, color: '#6B9BAA' }}>{role.permissions?.length ?? 0} permissions</p>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 mt-1" style={{ color: ac.color }} />}
                  </div>
                  <p style={{ fontSize: 11, color: '#6B9BAA', marginBottom: 12 }} className="line-clamp-1">{role.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5" style={{ color: ac.color }}>
                      <Users className="w-3.5 h-3.5" />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{role.userCount} users</span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); setEditRole(role); }}
                          className="w-6 h-6 flex items-center justify-center rounded-lg transition-all"
                          style={{ color: '#6B9BAA' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00FFB8'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,184,0.1)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setDeleteRole(role); }}
                          className="w-6 h-6 flex items-center justify-center rounded-lg transition-all"
                          style={{ color: '#6B9BAA' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF4757'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,71,87,0.1)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B9BAA'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Permission matrix */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <div className="rounded-2xl overflow-hidden"
              style={{ ...cardStyle, border: `1px solid ${accent.color}30` }}>

              {/* Header */}
              <div className="p-5" style={{ background: accent.bg, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${accent.color}20`, border: `1px solid ${accent.color}40`, boxShadow: `0 0 20px ${accent.color}20` }}>
                      <Shield className="w-5 h-5" style={{ color: accent.color }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{selected.name}</h2>
                      <p style={{ fontSize: 12, color: '#6B9BAA' }}>{selected.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ color: accent.color, background: `${accent.color}15`, border: `1px solid ${accent.color}30` }}>
                      {selected.permissions?.length ?? 0} active permissions
                    </span>
                    {isAdmin && (
                      <button onClick={() => setEditRole(selected)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{ background: `linear-gradient(135deg, ${accent.color}, #00C8FF)`, color: '#020508', boxShadow: `0 0 16px ${accent.color}35` }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                        <Edit2 className="w-3 h-3" /> Edit Role
                      </button>
                    )}
                    {!isAdmin && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B9BAA' }}>
                        <Lock className="w-3 h-3" /> View Only
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Permission grid — built from real API permissions */}
              <div className="p-5 space-y-5">
                {Object.entries(
                  permissions.reduce((acc, p) => {
                    if (!acc[p.category]) acc[p.category] = [];
                    acc[p.category].push(p);
                    return acc;
                  }, {} as Record<string, Permission[]>)
                ).map(([cat, perms]) => (
                  <div key={cat}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#3A6070', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                      {cat}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {perms.map(perm => {
                        const hasIt = selected.permissions?.some(p => p.id === perm.id || p.name === perm.name);
                        return (
                          <div key={perm.id} className="flex items-center gap-2.5 p-3 rounded-xl transition-all"
                            style={{
                              background: hasIt ? accent.bg : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${hasIt ? accent.color + '30' : 'rgba(255,255,255,0.07)'}`,
                            }}>
                            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                              style={{
                                background: hasIt ? accent.color : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${hasIt ? accent.color : 'rgba(255,255,255,0.1)'}`,
                                boxShadow: hasIt ? `0 0 8px ${accent.color}50` : 'none',
                              }}>
                              {hasIt && <Check className="w-2.5 h-2.5" style={{ color: '#020508' }} strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, color: hasIt ? '#fff' : '#6B9BAA' }}>{perm.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer stats */}
              <div className="px-5 py-4 flex items-center gap-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Users with this role', val: selected.userCount },
                  { label: 'Total permissions',    val: selected.permissions?.length ?? 0 },
                  { label: 'Created',              val: new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{s.val}</p>
                    <p style={{ fontSize: 11, color: '#6B9BAA', marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl flex items-center justify-center h-64" style={cardStyle}>
              <p style={{ fontSize: 14, color: '#6B9BAA' }}>Select a role to view permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
