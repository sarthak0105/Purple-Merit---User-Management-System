'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { User, Shield, Bell, Lock, Palette, ChevronRight, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';

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
  fontSize: 14,
  outline: 'none',
  width: '100%',
  padding: '11px 14px',
  transition: 'all 0.2s',
};

const ROLE_COLOR: Record<string, string> = {
  admin: '#00FFB8', manager: '#00C8FF', user: '#A855F7',
};

export default function SettingsPage() {
  const { user, login } = useAuth();
  const roleName  = user?.role?.name ?? 'user';
  const roleColor = ROLE_COLOR[roleName] ?? '#00FFB8';

  // Profile form
  const [name,  setName]  = useState(user?.name  ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError,   setProfileError]   = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [pwLoading,  setPwLoading]  = useState(false);
  const [pwError,    setPwError]    = useState('');
  const [pwSuccess,  setPwSuccess]  = useState(false);

  // Active section
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleProfileSave = async () => {
    setProfileError('');
    setProfileSuccess(false);
    if (!name.trim() || !email.trim()) { setProfileError('Name and email are required'); return; }
    setProfileLoading(true);
    const res = await ApiClient.put(API_ENDPOINTS.USER(user!.id), { name: name.trim(), email: email.trim() });
    setProfileLoading(false);
    if (!res.success) { setProfileError(res.error || 'Update failed'); return; }
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
    // Re-login to refresh token with new email
    try { await login(email.trim(), currentPw || 'password123'); } catch {}
  };

  const handlePasswordSave = async () => {
    setPwError('');
    setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) { setPwError('All fields are required'); return; }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setPwLoading(true);
    // Verify current password by attempting login
    try {
      await login(user!.email, currentPw);
    } catch {
      setPwLoading(false);
      setPwError('Current password is incorrect');
      return;
    }
    const res = await ApiClient.put(API_ENDPOINTS.USER(user!.id), { password: newPw });
    setPwLoading(false);
    if (!res.success) { setPwError(res.error || 'Password update failed'); return; }
    setPwSuccess(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const sections = [
    { id: 'profile',  icon: User,    label: 'Profile Settings', desc: 'Update your name and email',    color: roleColor },
    { id: 'security', icon: Lock,    label: 'Security',          desc: 'Change your password',          color: '#00C8FF' },
    { id: 'perms',    icon: Shield,  label: 'My Permissions',    desc: 'View your role and access',     color: '#FFD93D' },
    { id: 'notifs',   icon: Bell,    label: 'Notifications',     desc: 'Manage alert preferences',      color: '#FF2D6F' },
    { id: 'appear',   icon: Palette, label: 'Appearance',        desc: 'Theme and display options',     color: '#A855F7' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize: 11, color: '#6B9BAA', fontWeight: 500 }}>Configuration</span>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: roleColor, boxShadow: `0 0 6px ${roleColor}80` }} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px' }}>Settings</h1>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden" style={cardStyle}>
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
          style={{ background: `radial-gradient(circle at top right, ${roleColor}12 0%, transparent 65%)` }} />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${roleColor}, #00C8FF)`, color: '#020508', boxShadow: `0 0 24px ${roleColor}40` }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{user?.name}</p>
          <p style={{ fontSize: 13, color: '#6B9BAA', marginBottom: 6 }}>{user?.email}</p>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
            style={{ background: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30` }}>
            {user?.role?.name}
          </span>
        </div>
        <button onClick={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: `${roleColor}12`, border: `1px solid ${roleColor}25`, color: roleColor }}
          onMouseEnter={e => (e.currentTarget.style.background = `${roleColor}20`)}
          onMouseLeave={e => (e.currentTarget.style.background = `${roleColor}12`)}>
          {activeSection === 'profile' ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* ── Profile edit form ── */}
      {activeSection === 'profile' && (
        <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${roleColor}60, transparent)`, marginBottom: 4 }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Edit Profile</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = `${roleColor}50`; e.target.style.boxShadow = `0 0 0 3px ${roleColor}10`; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = `${roleColor}50`; e.target.style.boxShadow = `0 0 0 3px ${roleColor}10`; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
            </div>
          </div>

          {profileError && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757' }}>
              <X className="w-3.5 h-3.5 flex-shrink-0" />{profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(0,255,184,0.1)', border: '1px solid rgba(0,255,184,0.25)', color: '#00FFB8' }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />Profile updated successfully!
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setActiveSection(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}>
              Cancel
            </button>
            <button onClick={handleProfileSave} disabled={profileLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${roleColor}, #00C8FF)`, color: '#020508', boxShadow: `0 0 20px ${roleColor}30` }}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Password change form ── */}
      {activeSection === 'security' && (
        <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #00C8FF60, transparent)', marginBottom: 4 }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Change Password</p>

          {[
            { label: 'Current Password', val: currentPw, set: setCurrentPw, show: showCur, toggle: () => setShowCur(s => !s) },
            { label: 'New Password',     val: newPw,     set: setNewPw,     show: showNew, toggle: () => setShowNew(s => !s) },
            { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw, show: showNew, toggle: () => setShowNew(s => !s) },
          ].map(({ label, val, set, show, toggle }) => (
            <div key={label}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B9BAA', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{label}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,200,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,200,255,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                <button type="button" onClick={toggle}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#6B9BAA' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6B9BAA')}>
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {pwError && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757' }}>
              <X className="w-3.5 h-3.5 flex-shrink-0" />{pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(0,255,184,0.1)', border: '1px solid rgba(0,255,184,0.25)', color: '#00FFB8' }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />Password changed successfully!
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setActiveSection(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94B8C5' }}>
              Cancel
            </button>
            <button onClick={handlePasswordSave} disabled={pwLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00C8FF, #0090cc)', color: '#020508', boxShadow: '0 0 20px rgba(0,200,255,0.3)' }}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* ── Permissions view ── */}
      {activeSection === 'perms' && (
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #FFD93D60, transparent)', marginBottom: 16 }} />
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Your Permissions</p>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,217,61,0.12)', color: '#FFD93D', border: '1px solid rgba(255,217,61,0.25)' }}>
              {user?.role?.permissions?.length ?? 0} granted
            </span>
          </div>
          {user?.role?.permissions?.length ? (
            <div className="grid grid-cols-2 gap-2">
              {user.role.permissions.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(255,217,61,0.06)', border: '1px solid rgba(255,217,61,0.15)' }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: '#FFD93D' }}>
                    <CheckCircle2 className="w-2.5 h-2.5" style={{ color: '#020508' }} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{p.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#6B9BAA' }}>No permissions assigned to your role.</p>
          )}
        </div>
      )}

      {/* Settings list */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        {sections.map(({ id, icon: Icon, label, desc, color }, i) => (
          <button key={id}
            onClick={() => setActiveSection(activeSection === id ? null : id)}
            className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all group"
            style={{
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              background: activeSection === id ? `${color}06` : 'transparent',
            }}
            onMouseEnter={e => { if (activeSection !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { if (activeSection !== id) e.currentTarget.style.background = 'transparent'; }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 12, color: '#6B9BAA' }}>{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 transition-all group-hover:translate-x-0.5"
              style={{ color: activeSection === id ? color : '#3A6070', transform: activeSection === id ? 'rotate(90deg)' : '' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
