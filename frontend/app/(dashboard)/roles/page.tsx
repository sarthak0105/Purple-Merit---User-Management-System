'use client';

import { useState, useEffect } from 'react';
import { Role, Permission } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, Users, Shield, ChevronRight, Check, Lock, X, AlertTriangle, Crown, UserCog, BadgeCheck } from 'lucide-react';

// ── Role config with rich colors ──────────────────────────────────────────────
const ROLE_CONFIG: Record<string, {
  badge: string; border: string; bg: string; iconBg: string;
  icon: any; dot: string; accent: string;
}> = {
  admin: {
    badge:  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800/40',
    bg:     'bg-purple-50/50 dark:bg-purple-900/10',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    icon:   Crown,
    dot:    'bg-purple-500',
    accent: 'from-purple-500/20 to-transparent',
  },
  manager: {
    badge:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/40',
    bg:     'bg-blue-50/50 dark:bg-blue-900/10',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    icon:   UserCog,
    dot:    'bg-blue-500',
    accent: 'from-blue-500/20 to-transparent',
  },
  user: {
    badge:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700/40',
    bg:     'bg-gray-50/50 dark:bg-gray-800/10',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    icon:   BadgeCheck,
    dot:    'bg-gray-400',
    accent: 'from-gray-500/10 to-transparent',
  },
};

const PERM_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  users:     { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-700 dark:text-blue-400',   border: 'border-blue-200 dark:border-blue-800/40'   },
  roles:     { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/40' },
  dashboard: { bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-700 dark:text-green-400',  border: 'border-green-200 dark:border-green-800/40'  },
  settings:  { bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800/40'  },
};
// ── Role Modal ────────────────────────────────────────────────────────────────
function RoleModal({ role, permissions, onClose, onSaved }: {
  role: Role | null; permissions: Permission[]; onClose: () => void; onSaved: (r: Role) => void;
}) {
  const isEdit = !!role;
  const [name, setName]         = useState(role?.name ?? '');
  const [desc, setDesc]         = useState(role?.description ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissions?.map(p => p.id) ?? []));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState<string | null>(null);

  const togglePerm = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleSave = async () => {
    setError('');
    if (!name.trim()) { setError('Role name is required'); return; }
    if (!desc.trim()) { setError('Description is required'); return; }
    setLoading(true);
    const body = { name: name.trim(), description: desc.trim(), permissions: Array.from(selected) };
    const res = isEdit ? await ApiClient.put(API_ENDPOINTS.ROLE(role!.id), body) : await ApiClient.post(API_ENDPOINTS.ROLES, body);
    setLoading(false);
    if (!res.success) { setError(res.error || 'Failed to save'); return; }
    onSaved(res.data as Role);
    onClose();
  };

  const grouped = permissions.reduce((acc, p) => { if (!acc[p.category]) acc[p.category] = []; acc[p.category].push(p); return acc; }, {} as Record<string, Permission[]>);

  const inputCls = (field: string) => `w-full px-3 py-2.5 text-sm rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all ${
    focused === field
      ? 'bg-gray-50 dark:bg-[#0F0F12] border border-gray-400 dark:border-[#3F3F45] ring-2 ring-gray-200 dark:ring-[#2F2F35]'
      : 'bg-gray-50 dark:bg-[#0F0F12] border border-gray-200 dark:border-[#2F2F35] hover:border-gray-300 dark:hover:border-[#3F3F45]'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-enter w-full max-w-lg bg-white dark:bg-[#1F1F23] rounded-2xl border border-gray-200 dark:border-[#2F2F35] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2F2F35] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2F2F35] flex items-center justify-center">
              <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{isEdit ? 'Edit Role' : 'Create New Role'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2F2F35] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Role Name</label>
            <input value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="e.g. auditor" className={inputCls('name')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)} rows={2} placeholder="Describe what this role can do..." className={`${inputCls('desc')} resize-none`} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Permissions</label>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2F2F35] px-2 py-0.5 rounded-full">{selected.size} selected</span>
            </div>
            <div className="space-y-4">
              {Object.entries(grouped).map(([cat, perms]) => {
                const cc = PERM_CATEGORY_COLORS[cat] ?? PERM_CATEGORY_COLORS.settings;
                return (
                  <div key={cat}>
                    <p className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-2 ${cc.bg} ${cc.text}`}>{cat}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {perms.map(p => {
                        const on = selected.has(p.id);
                        return (
                          <button key={p.id} type="button" onClick={() => togglePerm(p.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-150 hover:scale-[1.01] ${on ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white shadow-sm' : 'bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#2F2F35] hover:border-gray-300 dark:hover:border-[#3F3F45]'}`}>
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${on ? 'bg-white dark:bg-gray-900 border-white dark:border-gray-900' : 'border-gray-300 dark:border-[#3F3F45]'}`}>
                              {on && <Check className="h-2.5 w-2.5 text-gray-900 dark:text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-xs font-medium ${on ? 'text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'}`}>{p.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-900 border-t-transparent animate-spin" />
                Saving...
              </span>
            ) : isEdit ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Role Modal ─────────────────────────────────────────────────────────
function DeleteRoleModal({ role, onClose, onDeleted }: { role: Role; onClose: () => void; onDeleted: (id: string) => void; }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-enter w-full max-w-sm bg-white dark:bg-[#1F1F23] rounded-2xl border border-gray-200 dark:border-[#2F2F35] shadow-2xl p-6 text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          <div className="relative w-14 h-14 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Delete Role?</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-semibold text-gray-900 dark:text-white capitalize">{role.name}</span> will be permanently removed.
        </p>
        {role.userCount > 0 && (
          <p className="text-xs text-red-600 dark:text-red-400 mb-4 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {role.userCount} user(s) assigned — cannot delete
          </p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={loading || role.userCount > 0} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-40 transition-colors">
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

  const [roles, setRoles]             = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<Role | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [editRole, setEditRole]       = useState<Role | null>(null);
  const [deleteRole, setDeleteRole]   = useState<Role | null>(null);
  const [toast, setToast]             = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadRoles = async () => {
    const r = await ApiClient.get<Role[]>(API_ENDPOINTS.ROLES);
    if (r.success && r.data) {
      const visible = isAdmin ? r.data : r.data.filter(role => role.name === currentUser?.role?.name);
      setRoles(visible);
      setSelected(prev => visible.find(x => x.id === prev?.id) ?? visible[0] ?? null);
    }
  };

  useEffect(() => {
    Promise.all([ApiClient.get<Role[]>(API_ENDPOINTS.ROLES), ApiClient.get<Permission[]>(API_ENDPOINTS.PERMISSIONS)])
      .then(([r, p]) => {
        if (r.success && r.data) {
          const visible = isAdmin ? r.data : r.data.filter(role => role.name === currentUser?.role?.name);
          setRoles(visible); setSelected(visible[0] ?? null);
        }
        if (p.success && p.data) setPermissions(p.data);
      }).finally(() => setLoading(false));
  }, [isAdmin, currentUser]);

  const handleRoleSaved = (saved: Role) => {
    loadRoles();
    setSelected(saved);
    showToast(editRole ? 'Role updated successfully' : 'Role created successfully');
    setEditRole(null); setShowCreate(false);
  };
  const handleRoleDeleted = (id: string) => {
    setRoles(r => r.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
    showToast('Role deleted');
  };

  const grouped = permissions.reduce((acc, p) => { if (!acc[p.category]) acc[p.category] = []; acc[p.category].push(p); return acc; }, {} as Record<string, Permission[]>);

  const selectedConfig = selected ? (ROLE_CONFIG[selected.name] ?? ROLE_CONFIG.user) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] rounded-xl shadow-lg text-sm font-medium text-gray-900 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          {toast}
        </div>
      )}

      {(showCreate || editRole) && <RoleModal role={editRole} permissions={permissions} onClose={() => { setShowCreate(false); setEditRole(null); }} onSaved={handleRoleSaved} />}
      {deleteRole && <DeleteRoleModal role={deleteRole} onClose={() => setDeleteRole(null)} onDeleted={handleRoleDeleted} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Roles & Permissions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{roles.length} roles configured</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 transition-all hover:-translate-y-0.5 shadow-sm">
            <Plus className="h-4 w-4" /> New Role
          </button>
        )}
      </div>

      <div className="flex gap-5">
        {/* Left — Role cards */}
        <div className="w-64 flex-shrink-0 space-y-2">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-white dark:bg-[#0F0F12] rounded-2xl border border-gray-200 dark:border-[#1F1F23] animate-pulse" />
            ))
          ) : roles.map(role => {
            const rc = ROLE_CONFIG[role.name] ?? ROLE_CONFIG.user;
            const RoleIcon = rc.icon;
            const isSel = selected?.id === role.id;
            return (
              <div key={role.id} onClick={() => setSelected(role)}
                className={`relative rounded-2xl border-2 cursor-pointer overflow-hidden group transition-all duration-200 hover:shadow-md ${
                  isSel
                    ? `${rc.border} ${rc.bg} shadow-sm`
                    : 'border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#0F0F12] hover:border-gray-300 dark:hover:border-[#2F2F35]'
                }`}>
                {/* Accent gradient top */}
                {isSel && (
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${rc.accent}`} />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSel ? rc.iconBg : 'bg-gray-100 dark:bg-[#1F1F23]'}`}>
                        <RoleIcon className={`h-4 w-4 ${isSel ? rc.badge.split(' ').find(c => c.startsWith('text-')) ?? 'text-gray-600' : 'text-gray-500 dark:text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{role.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{role.permissions?.length ?? 0} permissions</p>
                      </div>
                    </div>
                    {isSel && <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1 leading-relaxed">{role.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{role.userCount} users</span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); setEditRole(role); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors">
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setDeleteRole(role); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="h-3 w-3" />
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
          {selected && selectedConfig ? (
            <div className="bg-white dark:bg-[#0F0F12] rounded-2xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden shadow-sm">
              {/* Top accent */}
              <div className={`h-1 bg-gradient-to-r ${selectedConfig.accent} opacity-60`} />

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#1F1F23]">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${selectedConfig.iconBg}`}>
                    <selectedConfig.icon className={`h-5 w-5 ${selectedConfig.badge.split(' ').find(c => c.startsWith('text-')) ?? 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white capitalize">{selected.name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selected.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${selectedConfig.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedConfig.dot}`} />
                    {selected.permissions?.length ?? 0} permissions
                  </span>
                  {isAdmin ? (
                    <button onClick={() => setEditRole(selected)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2F2F35] rounded-xl hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors">
                      <Edit2 className="h-3.5 w-3.5" /> Edit Role
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2F2F35] rounded-xl">
                      <Lock className="h-3.5 w-3.5" /> View Only
                    </span>
                  )}
                </div>
              </div>

              {/* Permission grid */}
              <div className="p-6 space-y-6">
                {Object.entries(grouped).map(([cat, perms]) => {
                  const cc = PERM_CATEGORY_COLORS[cat] ?? PERM_CATEGORY_COLORS.settings;
                  const grantedCount = perms.filter(perm => selected.permissions?.some(p => p.id === perm.id || p.name === perm.name)).length;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${cc.bg} ${cc.text}`}>
                          {cat}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{grantedCount}/{perms.length}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {perms.map(perm => {
                          const hasIt = selected.permissions?.some(p => p.id === perm.id || p.name === perm.name);
                          return (
                            <div key={perm.id}
                              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                                hasIt
                                  ? `${cc.bg} ${cc.border}`
                                  : 'bg-gray-50 dark:bg-[#0F0F12] border-gray-100 dark:border-[#1F1F23]'
                              }`}>
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
                                hasIt ? `bg-gray-900 dark:bg-white border-gray-900 dark:border-white` : 'border-gray-300 dark:border-[#2F2F35]'
                              }`}>
                                {hasIt && <Check className="h-2.5 w-2.5 text-white dark:text-gray-900" strokeWidth={3} />}
                              </div>
                              <span className={`text-xs font-medium ${hasIt ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                {perm.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer stats */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-[#1F1F23] flex items-center gap-8 bg-gray-50/50 dark:bg-[#0F0F12]/50">
                {[
                  { label: 'Users assigned', val: selected.userCount },
                  { label: 'Total permissions', val: selected.permissions?.length ?? 0 },
                  { label: 'Created', val: new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{s.val}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0F0F12] rounded-2xl border border-gray-200 dark:border-[#1F1F23] flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1F1F23] flex items-center justify-center">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a role to view permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}