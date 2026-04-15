'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, ShieldCheck, SlidersHorizontal,
  LogOut, ChevronRight, BadgeCheck,
  Eye, Settings, Crown, UserCog,
} from 'lucide-react';

// ── Role-based nav items ──────────────────────────────────────────────────────
const NAV_BY_ROLE: Record<string, { id: string; label: string; href: string; icon: any; badge?: string }[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard',          href: '/dashboard', icon: LayoutDashboard },
    { id: 'users',     label: 'User Management',    href: '/users',     icon: Users,      badge: 'Full Access' },
    { id: 'roles',     label: 'Roles & Permissions',href: '/roles',     icon: ShieldCheck, badge: 'Admin' },
    { id: 'settings',  label: 'Settings',           href: '/settings',  icon: SlidersHorizontal },
  ],
  manager: [
    { id: 'dashboard', label: 'Dashboard',          href: '/dashboard', icon: LayoutDashboard },
    { id: 'users',     label: 'Users',              href: '/users',     icon: Users,      badge: 'View & Edit' },
    { id: 'roles',     label: 'Roles',              href: '/roles',     icon: Eye },
    { id: 'settings',  label: 'Settings',           href: '/settings',  icon: SlidersHorizontal },
  ],
  user: [
    { id: 'dashboard', label: 'Dashboard',          href: '/dashboard', icon: LayoutDashboard },
    { id: 'settings',  label: 'My Settings',        href: '/settings',  icon: Settings },
  ],
};

// Role display config
const ROLE_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; icon: any }> = {
  admin:   { color: '#00FFB8', bg: 'rgba(0,255,184,0.12)',  border: 'rgba(0,255,184,0.25)',  label: 'Admin',   icon: Crown },
  manager: { color: '#00C8FF', bg: 'rgba(0,200,255,0.12)',  border: 'rgba(0,200,255,0.25)',  label: 'Manager', icon: UserCog },
  user:    { color: '#A855F7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', label: 'User',    icon: BadgeCheck },
};

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();
  const handleLogout = () => { logout(); router.push('/login'); };

  const roleName  = user?.role?.name ?? 'user';
  const navItems  = NAV_BY_ROLE[roleName] ?? NAV_BY_ROLE.user;
  const roleConf  = ROLE_CONFIG[roleName] ?? ROLE_CONFIG.user;
  const RoleIcon  = roleConf.icon;
  const isAdmin   = roleName === 'admin';
  const isManager = roleName === 'manager';

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col rounded-2xl overflow-hidden relative"
      style={{
        height: 'calc(100vh - 24px)',
        background: 'linear-gradient(180deg, rgba(6,18,26,0.95) 0%, rgba(4,14,20,0.98) 100%)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>

      {/* Role-tinted inner glow */}
      <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${roleConf.color}18 0%, transparent 65%)` }} />

      {/* ── Logo ── */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${roleConf.color}, #00C8FF)`, boxShadow: `0 0 20px ${roleConf.color}50` }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: '#020508', letterSpacing: '-0.5px' }}>PM</span>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Purple Merit</p>
          <p style={{ fontSize: 10, color: `${roleConf.color}99`, fontWeight: 500 }}>
            {isAdmin ? 'Admin Portal' : isManager ? 'Manager Portal' : 'User Portal'}
          </p>
        </div>
      </div>

      {/* ── User profile ── */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
          style={{ background: `${roleConf.color}08`, border: `1px solid ${roleConf.color}18` }}>
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: `linear-gradient(135deg, ${roleConf.color}, #00C8FF)`, color: '#020508', boxShadow: `0 0 16px ${roleConf.color}50` }}>
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: '#00FFB8', border: '2px solid #06121a' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }} className="truncate">
                {user?.name ?? 'User'}
              </span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0"
                style={{ background: roleConf.bg, color: roleConf.color, border: `1px solid ${roleConf.border}` }}>
                <RoleIcon size={7} />
                {roleConf.label}
              </span>
            </div>
            <p style={{ fontSize: 10, color: '#6B9BAA' }} className="truncate">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p style={{ fontSize: 9, fontWeight: 700, color: '#3A6070', letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 8, marginBottom: 6 }}>
          {isAdmin ? 'Admin Menu' : isManager ? 'Manager Menu' : 'My Menu'}
        </p>
        {navItems.map(({ id, label, href, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={id} href={href}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 relative group"
                style={active ? {
                  background: `linear-gradient(90deg, ${roleConf.color}18 0%, ${roleConf.color}06 100%)`,
                  border: `1px solid ${roleConf.color}28`,
                  color: roleConf.color,
                  boxShadow: `0 0 20px ${roleConf.color}12`,
                } : {
                  border: '1px solid transparent',
                  color: '#6B9BAA',
                }}>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: `linear-gradient(180deg, ${roleConf.color}, #00C8FF)`, boxShadow: `0 0 8px ${roleConf.color}80` }} />
                )}
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={active ? {
                    background: `${roleConf.color}18`,
                    border: `1px solid ${roleConf.color}28`,
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                  <Icon size={13} style={{ color: active ? roleConf.color : '#6B9BAA' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, flex: 1 }}>{label}</span>
                {badge && !active && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${roleConf.color}12`, color: roleConf.color }}>
                    {badge}
                  </span>
                )}
                {active && <ChevronRight size={12} style={{ color: `${roleConf.color}60` }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── Manager: quick info ── */}
      {isManager && (
        <div className="mx-3 mb-2 p-3 rounded-xl"
          style={{ background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.15)' }}>
          <div className="flex items-center gap-2 mb-1">
            <UserCog size={12} style={{ color: '#00C8FF' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Manager Access</span>
          </div>
          <p style={{ fontSize: 10, color: '#6B9BAA', lineHeight: 1.5 }}>View & edit users. Contact admin to create new users.</p>
        </div>
      )}

      {/* ── User: profile info ── */}
      {!isAdmin && !isManager && (
        <div className="mx-3 mb-2 p-3 rounded-xl"
          style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <div className="flex items-center gap-2 mb-1">
            <BadgeCheck size={12} style={{ color: '#A855F7' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Standard User</span>
          </div>
          <p style={{ fontSize: 10, color: '#6B9BAA', lineHeight: 1.5 }}>Access your dashboard and manage your profile settings.</p>
        </div>
      )}

      {/* ── Logout ── */}
      <button onClick={handleLogout}
        className="mx-3 mb-4 flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all"
        style={{ color: '#6B9BAA', border: '1px solid transparent' }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#FF4757';
          e.currentTarget.style.background = 'rgba(255,71,87,0.08)';
          e.currentTarget.style.borderColor = 'rgba(255,71,87,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#6B9BAA';
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }}>
        <LogOut size={14} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Sign out</span>
      </button>
    </aside>
  );
}
