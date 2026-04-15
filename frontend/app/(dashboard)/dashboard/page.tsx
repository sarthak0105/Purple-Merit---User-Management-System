'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { DashboardStats } from '@/lib/types';
import {
  Users, UserCheck, ShieldCheck, Zap,
  ArrowUpRight, TrendingUp, Eye,
  Download, Upload, ChevronDown, ArrowUp,
} from 'lucide-react';

function Sparkline({ color, points }: { color: string; points: string }) {
  const id = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox="0 0 160 40" className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2"
        points={points} strokeLinecap="round" strokeLinejoin="round" />
      <polygon fill={`url(#${id})`} points={`0,40 ${points} 160,40`} />
    </svg>
  );
}

/* Card config — richer colors */
const CARDS = [
  { key: 'totalUsers',       label: 'Total Users',   icon: Users,      color: '#00FFB8', glow: 'rgba(0,255,184,0.25)',  pct: '+12.4%', up: true,  pts: '0,32 26,28 52,30 78,18 104,22 130,10 160,14' },
  { key: 'activeUsers',      label: 'Active Users',  icon: UserCheck,  color: '#00C8FF', glow: 'rgba(0,200,255,0.25)',  pct: '+8.1%',  up: true,  pts: '0,28 26,22 52,26 78,14 104,18 130,8 160,12'  },
  { key: 'totalRoles',       label: 'Total Roles',   icon: ShieldCheck,color: '#FF2D6F', glow: 'rgba(255,45,111,0.25)', pct: '-2.0%',  up: false, pts: '0,10 26,14 52,10 78,20 104,16 130,24 160,28' },
  { key: 'totalPermissions', label: 'Permissions',   icon: Zap,        color: '#FFD93D', glow: 'rgba(255,217,61,0.25)', pct: '+5.3%',  up: true,  pts: '0,30 26,24 52,28 78,16 104,20 130,10 160,14' },
];

const ACTIVITY_ACTIONS = ['User Created', 'Role Updated', 'Profile Edit', 'Password Reset', 'User Login'];
const PAGE_SIZE = 3; // recent users per page in activity table

const statusStyle = (s: string) => {
  if (s === 'active')     return { color: '#00FFB8', bg: 'rgba(0,255,184,0.12)',  border: 'rgba(0,255,184,0.25)'  };
  if (s === 'inactive')   return { color: '#6B9BAA', bg: 'rgba(107,155,170,0.1)', border: 'rgba(107,155,170,0.2)' };
  if (s === 'suspended')  return { color: '#FF4757', bg: 'rgba(255,71,87,0.12)',  border: 'rgba(255,71,87,0.25)'  };
  return                         { color: '#FFD93D', bg: 'rgba(255,217,61,0.12)', border: 'rgba(255,217,61,0.25)' };
};

const roleStyle = (r: string) => {
  if (r === 'admin')   return { color: '#00FFB8', bg: 'rgba(0,255,184,0.12)' };
  if (r === 'manager') return { color: '#00C8FF', bg: 'rgba(0,200,255,0.12)' };
  return                      { color: '#A855F7', bg: 'rgba(168,85,247,0.1)' };
};

/* Shared card style */
const cardStyle = {
  background: 'linear-gradient(135deg, rgba(6,18,26,0.85) 0%, rgba(4,14,20,0.9) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const roleName = user?.role?.name ?? 'user';
  const isAdmin  = roleName === 'admin';
  const isManager = roleName === 'manager';

  const ROLE_COLOR: Record<string, string> = { admin: '#00FFB8', manager: '#00C8FF', user: '#A855F7' };
  const accentColor = ROLE_COLOR[roleName] ?? '#00FFB8';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Activity');
  const [actPage, setActPage] = useState(1); // activity table pagination

  useEffect(() => {
    ApiClient.get<DashboardStats>(API_ENDPOINTS.STATS)
      .then(r => {
        if (r.success && r.data) setStats(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const val = (k: string) => loading ? '—' : ((stats as any)?.[k] ?? 0).toLocaleString();

  return (
    <div className="flex gap-5 min-h-0">

      {/* ══ Main column ══ */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 11, color: '#6B9BAA', fontWeight: 500 }}>{greeting()},</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>{user?.name?.split(' ')[0]}</span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}80` }} />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}25` }}>
                {user?.role?.name} · {stats?.totalUsers ?? '—'} users
              </span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1 }}>
              {isAdmin ? 'System Overview' : isManager ? 'Team Overview' : 'My Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {['24H', 'Role', 'Desc'].map(f => (
              <button key={f} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:border-white/20 hover:text-white"
                style={{ background: 'rgba(6,18,26,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B9BAA' }}>
                {f} <ChevronDown size={11} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {CARDS.map(({ key, label, icon: Icon, color, glow, pct, up, pts }) => (
            <div key={key} className="rounded-2xl overflow-hidden relative group cursor-pointer"
              style={{ ...cardStyle, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.borderColor = `${color}35`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.6), 0 0 40px ${glow}, inset 0 1px 0 rgba(255,255,255,0.1)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)';
              }}>

              {/* Top accent line */}
              <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />

              {/* Corner glow */}
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${color}18 0%, transparent 65%)` }} />

              <div className="p-4 pb-2 relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p style={{ fontSize: 11, color: '#6B9BAA', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                      {loading
                        ? <span className="inline-block w-16 h-7 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        : val(key)}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}35`,
                      boxShadow: `0 0 16px ${color}25`,
                    }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowUp size={11} style={{ color, transform: up ? '' : 'rotate(180deg)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}</span>
                  <span style={{ fontSize: 11, color: '#6B9BAA' }}>vs last month</span>
                </div>
              </div>

              <Sparkline color={color} points={pts} />
            </div>
          ))}
        </div>

        {/* ── Activity table ── */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="px-5 pt-5 pb-0 flex items-center justify-between">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Activity Log</h2>
            <div className="flex items-center gap-1">
              {['Activity', 'Created', 'Updated'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={tab === t
                    ? { color: '#00FFB8', background: 'rgba(0,255,184,0.12)', border: '1px solid rgba(0,255,184,0.25)' }
                    : { color: '#6B9BAA', border: '1px solid transparent' }}>
                  {t}
                </button>
              ))}
              <button className="flex items-center gap-1 ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ color: '#00FFB8', background: 'rgba(0,255,184,0.08)', border: '1px solid rgba(0,255,184,0.2)' }}>
                View All <ArrowUpRight size={11} />
              </button>
            </div>
          </div>

          <div className="mx-5 mt-4 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Activity table with pagination */}
          {(() => {
            const allUsers = stats?.recentUsers ?? [];
            const totalPages = Math.ceil(allUsers.length / PAGE_SIZE);
            const pageUsers  = allUsers.slice((actPage - 1) * PAGE_SIZE, actPage * PAGE_SIZE);
            return (
              <>
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Date', 'User', 'Action', 'Role', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left"
                          style={{ fontSize: 10, fontWeight: 700, color: '#3A6070', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          {[...Array(5)].map((_, j) => (
                            <td key={j} className="px-5 py-4">
                              <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : allUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <Users size={20} style={{ color: '#3A6070' }} />
                            </div>
                            <p style={{ fontSize: 13, color: '#6B9BAA' }}>No users yet — create your first user</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pageUsers.map((u, i) => {
                        const ss = statusStyle(u.status);
                        const rs = roleStyle(u.role?.name);
                        const action = ACTIVITY_ACTIONS[((actPage - 1) * PAGE_SIZE + i) % ACTIVITY_ACTIONS.length];
                        return (
                          <tr key={u.id} className="transition-all cursor-pointer"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}05`)}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#6B9BAA' }}>
                              {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                  style={{ background: `linear-gradient(135deg, ${accentColor}, #00C8FF)`, color: '#020508', boxShadow: `0 0 10px ${accentColor}30` }}>
                                  {u.name.charAt(0)}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5" style={{ fontSize: 13, color: '#94B8C5' }}>{action}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                                style={{ color: rs.color, background: rs.bg }}>{u.role?.name}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                                style={{ color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}>
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Pagination footer */}
                {!loading && allUsers.length > PAGE_SIZE && (
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 11, color: '#6B9BAA' }}>
                      Showing {(actPage - 1) * PAGE_SIZE + 1}–{Math.min(actPage * PAGE_SIZE, allUsers.length)} of {allUsers.length} users
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => setActPage(p => Math.max(1, p - 1))} disabled={actPage === 1}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                        style={{ color: '#6B9BAA', border: '1px solid transparent' }}>
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setActPage(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={p === actPage
                            ? { background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }
                            : { color: '#6B9BAA', border: '1px solid transparent' }}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setActPage(p => Math.min(totalPages, p + 1))} disabled={actPage === totalPages}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                        style={{ color: '#6B9BAA', border: '1px solid transparent' }}>
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* ══ Right panel ══ */}
      <div className="w-64 flex-shrink-0 space-y-4">

        {/* Hero card */}
        <div className="rounded-2xl overflow-hidden relative" style={{ ...cardStyle, minHeight: 190 }}>
          {/* Big teal glow */}
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top right, rgba(0,255,184,0.2) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(circle at bottom left, rgba(0,200,255,0.12) 0%, transparent 65%)' }} />

          <div className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', boxShadow: '0 0 14px rgba(0,255,184,0.5)' }}>
                  <span style={{ fontSize: 7, fontWeight: 900, color: '#020508' }}>PM</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Purple Merit</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', color: '#020508' }}>New</span>
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
              User Management<br />Portal
            </h3>
            <p style={{ fontSize: 11, color: '#6B9BAA', lineHeight: 1.6, marginBottom: 16 }}>
              All-in-one portal to manage users, roles and permissions.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #00FFB8, #00C8FF)', color: '#020508', boxShadow: '0 0 20px rgba(0,255,184,0.35)' }}>
                Manage Users
              </button>
              <button className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                View Roles →
              </button>
            </div>
          </div>
        </div>

        {/* System health */}
        <div className="rounded-2xl p-4" style={cardStyle}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>System Health</span>
              <Eye size={13} style={{ color: '#6B9BAA' }} />
            </div>
            <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
              style={{ background: 'rgba(0,255,184,0.08)', border: '1px solid rgba(0,255,184,0.15)', color: '#00FFB8' }}>
              Live <ChevronDown size={10} />
            </button>
          </div>
          <div className="flex items-end gap-2 mb-1">
            <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
              {stats?.activeUsers ?? 856}
            </span>
            <span className="flex items-center gap-0.5 mb-1 text-xs font-bold" style={{ color: '#00FFB8' }}>
              <TrendingUp size={11} /> 6.3%
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#6B9BAA', marginBottom: 14 }}>Active users right now</p>
          <div className="flex gap-2">
            {[
              { icon: Download, label: 'Export', color: '#00FFB8' },
              { icon: Upload,   label: 'Import', color: '#00C8FF' },
              { icon: Users,    label: 'All',    color: '#6B9BAA' },
            ].map(({ icon: Icon, label, color }) => (
              <button key={label} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all hover:border-white/20"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon size={13} style={{ color }} />
                <span style={{ fontSize: 10, color: '#6B9BAA' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role distribution */}
        <div className="rounded-2xl p-4" style={cardStyle}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Role Distribution</p>
          <div className="space-y-4">
            {[
              { label: 'Admin',   pct: 5,  color: '#00FFB8' },
              { label: 'Manager', pct: 20, color: '#00C8FF' },
              { label: 'User',    pct: 75, color: '#FF2D6F' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: 12, color: '#94B8C5', fontWeight: 500 }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{r.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${r.pct}%`, background: `linear-gradient(90deg, ${r.color}, ${r.color}99)`, boxShadow: `0 0 8px ${r.color}60` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
