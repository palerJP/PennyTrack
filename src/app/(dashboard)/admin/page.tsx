'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  PieChart,
  ArrowUpRight,
  Trash2,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | string;
  currency: string;
  avatar: string | null;
  createdAt: string;
  _count: {
    transactions: number;
    budgets: number;
    recurring: number;
  };
}

interface PlatformStats {
  totalUsers: number;
  totalTransactions: number;
  totalBudgets: number;
  totalIncomeVolume: number;
  totalExpenseVolume: number;
}

export default function AdminPage() {
  const { user, loading: authLoading, formatMoney } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) {
        toast.error('Admin access required');
        router.push('/dashboard');
        return;
      }
      if (!res.ok) throw new Error('Failed to load admin data');

      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        toast.error('You must be an administrator to view this page.');
        router.push('/dashboard');
        return;
      }
      fetchAdminData();
    }
  }, [user, authLoading]);

  const handleToggleRole = async (targetUser: AdminUser) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setActionLoading(targetUser.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser.id, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');

      toast.success(`Role updated: ${targetUser.name} is now a ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    if (targetUser.id === user?.id) {
      toast.error('You cannot delete your own admin account');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user "${targetUser.name}" (${targetUser.email}) and all their data?`)) {
      return;
    }

    setActionLoading(targetUser.id);
    try {
      const res = await fetch(`/api/admin/users?id=${targetUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      toast.success(`User ${targetUser.name} deleted successfully`);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      if (stats) {
        setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || (loading && users.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading PennyTrack Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                System Administration
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Manage registered user accounts, roles, and review platform metrics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            isLoading={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {stats.totalUsers}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Saved permanently in PostgreSQL
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transactions Logged</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {stats.totalTransactions}
            </p>
            <p className="text-xs text-slate-500 mt-1">Across all user accounts</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Budgets</span>
              <div className="p-2 bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 rounded-xl">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {stats.totalBudgets}
            </p>
            <p className="text-xs text-slate-500 mt-1">Category budget limits configured</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Status</span>
              <div className="p-2 bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                Connected
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">Neon Serverless PostgreSQL</p>
          </div>
        </div>
      )}

      {/* Pre-Seeded Super Admin Credentials Info Banner */}
      <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-emerald-900/10 border border-purple-500/20 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-600/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Default Master Admin Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Always available from any browser/device without needing Google sign-in:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 font-bold">
              Email: admin@pennytrack.com
            </span>
            <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 font-bold">
              Password: admin123456
            </span>
          </div>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Registered Accounts ({users.length})
            </h2>
            <p className="text-xs text-slate-500">
              All accounts registered on PennyTrack across all devices
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Currency</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No users matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentAdmin = u.id === user?.id;
                  const isUserAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover bg-emerald-100 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {u.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {u.name}
                              </span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isUserAdmin
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isUserAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : null}
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {u.currency}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                          <span>
                            <strong className="text-slate-900 dark:text-white font-bold">
                              {u._count.transactions}
                            </strong> txs
                          </span>
                          <span>
                            <strong className="text-slate-900 dark:text-white font-bold">
                              {u._count.budgets}
                            </strong> budgets
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={actionLoading === u.id || isCurrentAdmin}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                              isUserAdmin
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                                : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
                            } disabled:opacity-40`}
                            title={isUserAdmin ? 'Demote to User' : 'Promote to Admin'}
                          >
                            {isUserAdmin ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Demote</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Make Admin</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={actionLoading === u.id || isCurrentAdmin}
                            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 rounded-xl transition disabled:opacity-40"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
}
