'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings2, Search, X, ChevronDown,
  UserPlus, Shield, LayoutDashboard, LogOut,
  Crown, UserCog, BadgeCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Role display config — matches Sidebar
const ROLE_CONFIG: Record<string, { color: string; label: string; icon: any; pageLabel: string }> = {
  admin:   { color: '#00FFB8', label: 'Admin',   icon: Crown,      pageLabel: 'Admin Dashboard'   },
  manager: { color: '#00C8FF', label: 'Manager', icon: UserCog,    pageLabel: 'Manager Dashboard' },
  user:    { color: '#A855F7', label: 'User',    icon: BadgeCheck, pageLabel: 'My Dashboard'      },
};

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const [dropOpen, setDropOpen]     = useState(false);

  const roleName = user?.role?.name ?? 'user';
  const roleConf = ROLE_CONFIG[roleName] ?? ROLE_CONFIG.user;
  const RoleIcon = roleConf.icon;
  const isAdmin   = roleName === 'admin';
  const isManager = roleName === 'manager';

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <nav className="flex items-center justify-between px-5 rounded-2xl relative"
      style={{
        height: 52,
        background: 'linear-gradient(135deg, rgba(6,18,26,0.9) 0%, rgba(4,14,20,0.95) 100%)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>

      {/* ── Left: Logo + current page ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${roleConf.color}, #00C8FF)`, boxShadow: `0 0 20px ${roleConf.color}50` }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: '#020508', letterSpacing: '-0.5px' }}>PM</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Purple Merit</span>
        <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        {/* Role badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: `${roleConf.color}12`, border: `1px solid ${roleConf.color}25` }}>
          <RoleIcon size={10} style={{ color: roleConf.color }} />
          <span style={{ fontSize: 11, color: roleConf.color, fontWeight: 600 }}>{roleConf.label}</span>
        </div>
      </div>

      {/* ── Center: Role-based action button ── */}
      <div className="flex items-center gap-2">
        {/* Admin: Invite / Create User */}
        {isAdmin && (
          <Link href="/users/new">
            <button className="flex items-center gap-2 px-4 h-8 rounded-full text-xs font-bold transition-all hover:opacity-90 hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', color: '#020508', boxShadow: '0 0 24px rgba(0,255,184,0.45)' }}>
              <UserPlus size={12} />
              <span>New User</span>
            </button>
          </Link>
        )}

        {/* Manager: View Users */}
        {isManager && (
          <Link href="/users">
            <button className="flex items-center gap-2 px-4 h-8 rounded-full text-xs font-bold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #00C8FF, #0090cc)', color: '#020508', boxShadow: '0 0 24px rgba(0,200,255,0.4)' }}>
              <Shield size={12} />
              <span>Manage Users</span>
            </button>
          </Link>
        )}

        {/* User: Go to Dashboard */}
        {!isAdmin && !isManager && (
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 h-8 rounded-full text-xs font-bold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7c3aed)', color: '#fff', boxShadow: '0 0 24px rgba(168,85,247,0.4)' }}>
              <LayoutDashboard size={12} />
              <span>My Dashboard</span>
            </button>
          </Link>
        )}
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1">

        {/* Bell — admin/manager only */}
        {(isAdmin || isManager) && (
          <button className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#6B9BAA' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B9BAA'; }}>
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{ background: roleConf.color, boxShadow: `0 0 6px ${roleConf.color}80` }} />
          </button>
        )}

        {/* Settings */}
        <Link href="/settings">
          <button className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#6B9BAA' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B9BAA'; }}>
            <Settings2 size={15} />
          </button>
        </Link>

        {/* Search */}
        {searchOpen ? (
          <div className="flex items-center gap-2 px-3 h-8 rounded-xl"
            style={{ background: 'rgba(6,18,26,0.9)', border: `1px solid ${roleConf.color}30` }}>
            <Search size={13} style={{ color: roleConf.color }} />
            <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Search..." className="bg-transparent outline-none w-28"
              style={{ fontSize: 13, color: '#fff' }} />
            <button onClick={() => { setSearchOpen(false); setSearchVal(''); }}>
              <X size={13} style={{ color: '#6B9BAA' }} />
            </button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl transition-all"
            style={{ color: '#6B9BAA' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B9BAA'; }}>
            <Search size={14} />
            <span style={{ fontSize: 13 }} className="hidden sm:inline">Search...</span>
          </button>
        )}

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen(d => !d)}
            className="flex items-center gap-2 px-2 h-8 rounded-xl transition-all"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => { if (!dropOpen) e.currentTarget.style.background = 'transparent'; }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${roleConf.color}, #00C8FF)`, color: '#020508', boxShadow: `0 0 10px ${roleConf.color}40` }}>
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                {user?.name?.split(' ')[0]}
              </span>
              <span style={{ fontSize: 10, color: roleConf.color, lineHeight: 1.2 }}>{roleConf.label}</span>
            </div>
            <ChevronDown size={12} style={{ color: '#6B9BAA', transform: dropOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 top-10 w-52 rounded-2xl overflow-hidden z-50"
                style={{ background: 'linear-gradient(135deg, #06121a 0%, #040e14 100%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>

                {/* User info */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${roleConf.color}, #00C8FF)`, color: '#020508' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }} className="truncate">{user?.name}</p>
                      <p style={{ fontSize: 11, color: '#6B9BAA' }} className="truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
                    style={{ background: `${roleConf.color}10`, border: `1px solid ${roleConf.color}20` }}>
                    <RoleIcon size={10} style={{ color: roleConf.color }} />
                    <span style={{ fontSize: 10, color: roleConf.color, fontWeight: 600 }}>{roleConf.label} — {roleConf.pageLabel}</span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <Link href="/settings" onClick={() => setDropOpen(false)}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                      style={{ color: '#94B8C5' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94B8C5'; }}>
                      <Settings2 size={14} />
                      <span style={{ fontSize: 13 }}>Settings</span>
                    </button>
                  </Link>

                  {isAdmin && (
                    <Link href="/users" onClick={() => setDropOpen(false)}>
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                        style={{ color: '#94B8C5' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94B8C5'; }}>
                        <Shield size={14} />
                        <span style={{ fontSize: 13 }}>Manage Users</span>
                      </button>
                    </Link>
                  )}

                  <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                  <button onClick={() => { setDropOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                    style={{ color: '#FF4757' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,71,87,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <LogOut size={14} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
