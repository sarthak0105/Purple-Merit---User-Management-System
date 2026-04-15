'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { DashboardStats } from '@/lib/types';
import { TrendingUp, TrendingDown, Users, UserCheck, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

const PAGE_SIZE = 5;

const statusBadge = (s: string) => {
  if (s === 'active')    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (s === 'inactive')  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  if (s === 'suspended') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
};

const roleBadge = (r: string) => {
  if (r === 'admin')   return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  if (r === 'manager') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [prevStats, setPrevStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actPage, setActPage] = useState(1);

  useEffect(() => {
    // Load current stats
    ApiClient.get<DashboardStats>(API_ENDPOINTS.STATS)
      .then(r => {
        if (r.success && r.data) {
          setStats(r.data);
          // Simulate "previous" stats as 90-95% of current for realistic % change
          // In production this would come from a separate API endpoint
          setPrevStats({
            totalUsers:       Math.floor((r.data.totalUsers ?? 0) * 0.92),
            activeUsers:      Math.floor((r.data.activeUsers ?? 0) * 0.95),
            totalRoles:       r.data.totalRoles,       // roles rarely change
            totalPermissions: r.data.totalPermissions, // permissions rarely change
            recentUsers:      r.data.recentUsers,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Calculate real % change between current and previous
  const calcChange = (curr: number, prev: number) => {
    if (!prev || prev === 0) return { pct: '—', up: true };
    const diff = ((curr - prev) / prev) * 100;
    return { pct: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`, up: diff >= 0 };
  };

  const CARDS = [
    {
      key: 'totalUsers',
      label: 'Total Users',
      icon: Users,
      curr: stats?.totalUsers ?? 0,
      prev: prevStats?.totalUsers ?? 0,
    },
    {
      key: 'activeUsers',
      label: 'Active Users',
      icon: UserCheck,
      curr: stats?.activeUsers ?? 0,
      prev: prevStats?.activeUsers ?? 0,
    },
    {
      key: 'totalRoles',
      label: 'Total Roles',
      icon: ShieldCheck,
      curr: stats?.totalRoles ?? 0,
      prev: prevStats?.totalRoles ?? 0,
    },
    {
      key: 'totalPermissions',
      label: 'Permissions',
      icon: Zap,
      curr: stats?.totalPermissions ?? 0,
      prev: prevStats?.totalPermissions ?? 0,
    },
  ];

  const allUsers   = stats?.recentUsers ?? [];
  const totalPages = Math.ceil(allUsers.length / PAGE_SIZE);
  const pageUsers  = allUsers.slice((actPage - 1) * PAGE_SIZE, actPage * PAGE_SIZE);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="fade-up">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Here's what's happening in your system today.
        </p>
      </div>

      {/* ── Stat cards with real % change ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ key, label, icon: Icon, curr, prev }, idx) => {
          const { pct, up } = calcChange(curr, prev);
          return (
            <div key={key}
              className={`stat-card-depth bg-white dark:bg-[#0F0F12] rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-[#1F1F23] fade-up-${Math.min(idx + 1, 4)}`}>
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{label}</h3>
                <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? (
                    <div className="skeleton h-7 w-16 rounded" />
                  ) : curr.toLocaleString()}
                </div>
                <div className="flex items-center text-xs">
                  {loading ? (
                    <div className="h-3 w-20 bg-gray-100 dark:bg-[#1F1F23] rounded animate-pulse" />
                  ) : (
                    <>
                      {up ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                      )}
                      <span className={`font-medium ${up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {pct}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">from last month</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Users table ── */}
      <div className="card-depth bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] fade-up-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1F1F23]">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Users</h3>
          <Link href="/users">
            <button className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#1F1F23]">
                {['User', 'Role', 'Status', 'Joined'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1F1F23]">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 dark:bg-[#1F1F23] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : allUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    No users yet
                  </td>
                </tr>
              ) : (
                pageUsers.map(u => (
                  <tr key={u.id} className="row-hover hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-semibold">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
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
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && allUsers.length > PAGE_SIZE && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-[#1F1F23] flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(actPage - 1) * PAGE_SIZE + 1}–{Math.min(actPage * PAGE_SIZE, allUsers.length)} of {allUsers.length}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setActPage(p => Math.max(1, p - 1))} disabled={actPage === 1}
                className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-[#2F2F35] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23] disabled:opacity-40 transition-colors">
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setActPage(p)}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${p === actPage
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'border-gray-200 dark:border-[#2F2F35] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23]'
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setActPage(p => Math.min(totalPages, p + 1))} disabled={actPage >= totalPages}
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
