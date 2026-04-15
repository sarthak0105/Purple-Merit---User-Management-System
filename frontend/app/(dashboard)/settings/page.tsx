'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { User, Shield, Lock, Palette, ChevronRight, Eye, EyeOff, CheckCircle2, Sun, Moon } from 'lucide-react';

const ROLE_BADGE: Record<string, string> = {
  admin:   'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  user:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function SettingsPage() {
  const { user, login } = useAuth();
  const roleName = user?.role?.name ?? 'user';

  const [name,  setName]  = useState(user?.name  ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError,   setProfileError]   = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError,   setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleProfileSave = async () => {
    setProfileError(''); setProfileSuccess(false);
    if (!name.trim() || !email.trim()) { setProfileError('Name and email are required'); return; }
    setProfileLoading(true);
    const res = await ApiClient.put(API_ENDPOINTS.USER(user!.id), { name: name.trim(), email: email.trim() });
    setProfileLoading(false);
    if (!res.success) { setProfileError(res.error || 'Update failed'); return; }
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordSave = async () => {
    setPwError(''); setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) { setPwError('All fields are required'); return; }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setPwLoading(true);
    try { await login(user!.email, currentPw); } catch { setPwLoading(false); setPwError('Current password is incorrect'); return; }
    const res = await ApiClient.put(API_ENDPOINTS.USER(user!.id), { password: newPw });
    setPwLoading(false);
    if (!res.success) { setPwError(res.error || 'Password update failed'); return; }
    setPwSuccess(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const sections = [
    { id: 'profile',  icon: User,    label: 'Profile Settings',  desc: 'Update your name and email'    },
    { id: 'security', icon: Lock,    label: 'Security',           desc: 'Change your password'          },
    { id: 'perms',    icon: Shield,  label: 'My Permissions',     desc: 'View your role and access'     },
    { id: 'appear',   icon: Palette, label: 'Appearance',         desc: 'Switch between light and dark theme' },
  ];

  const inputCls = "w-full px-3 py-2 text-sm bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-all";

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences.</p>
      </div>

      {/* Profile card */}
      <div className="card-depth bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_BADGE[roleName]}`}>
              {user?.role?.name}
            </span>
          </div>
          <button
            onClick={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#2F2F35] transition-colors"
          >
            {activeSection === 'profile' ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile edit form */}
      {activeSection === 'profile' && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Edit Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
            </div>
          </div>
          {profileError && <p className="text-sm text-red-600 dark:text-red-400">{profileError}</p>}
          {profileSuccess && <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />Profile updated successfully!</p>}
          <div className="flex gap-3">
            <button onClick={() => setActiveSection(null)} className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">Cancel</button>
            <button onClick={handleProfileSave} disabled={profileLoading} className="flex-1 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Password form */}
      {activeSection === 'security' && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h3>
          {[
            { label: 'Current Password', val: currentPw, set: setCurrentPw, show: showCur, toggle: () => setShowCur(s => !s) },
            { label: 'New Password',     val: newPw,     set: setNewPw,     show: showNew, toggle: () => setShowNew(s => !s) },
            { label: 'Confirm Password', val: confirmPw, set: setConfirmPw, show: showNew, toggle: () => setShowNew(s => !s) },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              <div className="relative">
                <input type={f.show ? 'text' : 'password'} value={f.val} onChange={e => f.set(e.target.value)}
                  className={`${inputCls} pr-10`} />
                <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {f.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          {pwError && <p className="text-sm text-red-600 dark:text-red-400">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />Password changed successfully!</p>}
          <div className="flex gap-3">
            <button onClick={() => setActiveSection(null)} className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F0F12] border border-gray-300 dark:border-[#2F2F35] rounded-md hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">Cancel</button>
            <button onClick={handlePasswordSave} disabled={pwLoading} className="flex-1 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors">
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* Permissions view */}
      {activeSection === 'perms' && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Permissions</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role?.permissions?.length ?? 0} granted</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(user?.role?.permissions ?? []).map(p => (
              <div key={p.id} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-[#1F1F23] rounded-md border border-gray-200 dark:border-[#2F2F35]">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appearance section */}
      {activeSection === 'appear' && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1F1F23] rounded-lg border border-gray-200 dark:border-[#2F2F35]">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Currently using {isDark ? 'dark' : 'light'} theme</p>
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDark ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform shadow ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => { if (isDark) toggleTheme(); }}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${!isDark ? 'border-gray-900 bg-gray-50' : 'border-gray-200 dark:border-[#2F2F35] hover:border-gray-300 dark:hover:border-[#3F3F45]'}`}
            >
              <Sun className="h-5 w-5 text-amber-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Light</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Clean white interface</p>
              </div>
              {!isDark && <CheckCircle2 className="h-4 w-4 text-gray-900 ml-auto" />}
            </button>
            <button
              onClick={() => { if (!isDark) toggleTheme(); }}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${isDark ? 'border-white dark:border-white bg-[#1F1F23]' : 'border-gray-200 dark:border-[#2F2F35] hover:border-gray-300 dark:hover:border-[#3F3F45]'}`}
            >
              <Moon className="h-5 w-5 text-blue-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dark</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</p>
              </div>
              {isDark && <CheckCircle2 className="h-4 w-4 text-white ml-auto" />}
            </button>
          </div>
        </div>
      )}

      {/* Settings list */}
      <div className="card-depth bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
        {sections.map(({ id, icon: Icon, label, desc }, i) => (
          <button key={id}
            onClick={() => setActiveSection(activeSection === id ? null : id)}
            className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1F1F23] ${i > 0 ? 'border-t border-gray-100 dark:border-[#1F1F23]' : ''} ${activeSection === id ? 'bg-gray-50 dark:bg-[#1F1F23]' : ''}`}>
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2F2F35] flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${activeSection === id ? 'rotate-90' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
