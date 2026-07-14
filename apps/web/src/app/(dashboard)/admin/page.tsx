'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Shield, Users, BarChart3, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getPriorityBadge, formatDateTime, formatDate } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (user?.role !== 'ADMIN') {
    router.replace('/dashboard');
    return null;
  }

  return <AdminContent />;
}

function AdminContent() {
  const queryClient = useQueryClient();
  const [userPage, setUserPage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats() as any,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userPage],
    queryFn: () => adminApi.getUsers({ page: userPage, limit: 20 }) as any,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-logs', logPage],
    queryFn: () => adminApi.getAuditLogs({ page: logPage, limit: 20 }) as any,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role updated!', variant: 'success' as any });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Status updated!', variant: 'success' as any });
    },
  });

  const stats = statsData?.data;
  const users: any[] = usersData?.data?.data ?? [];
  const userMeta = usersData?.data?.meta ?? {};
  const logs: any[] = logsData?.data?.data ?? [];
  const logMeta = logsData?.data?.meta ?? {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <p className="text-slate-400 text-sm">System management and oversight</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.users?.total, icon: Users },
          { label: 'Active Users', value: stats?.users?.active, icon: Users },
          { label: 'Total Businesses', value: stats?.businesses?.total, icon: BarChart3 },
          { label: 'Total Analyses', value: stats?.analyses?.total, icon: FileText },
        ].map((card) => (
          <div key={card.label} className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
            {statsLoading ? (
              <><Skeleton className="h-4 w-20 mb-3" /><Skeleton className="h-8 w-12" /></>
            ) : (
              <>
                <div className="text-3xl font-bold text-white mb-1">{card.value ?? 0}</div>
                <div className="text-sm text-slate-400">{card.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="bg-slate-800/60">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} className="px-5 py-3"><Skeleton className="h-10 w-full" /></td></tr>
                    ))
                  ) : users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/50 flex items-center justify-center text-white text-xs font-bold">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <span className="text-white text-sm font-medium">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-sm">{u.email}</td>
                      <td className="px-5 py-3">
                        <select
                          value={u.role}
                          onChange={e => updateRoleMutation.mutate({ id: u.id, role: e.target.value })}
                          className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="USER">USER</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={u.status}
                          onChange={e => updateStatusMutation.mutate({ id: u.id, status: e.target.value })}
                          className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-sm">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userMeta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50">
                <span className="text-sm text-slate-400">Page {userMeta.page} of {userMeta.totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={!userMeta.hasPreviousPage} className="p-2 text-slate-400 border border-slate-700 rounded-lg disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setUserPage(p => p + 1)} disabled={!userMeta.hasNextPage} className="p-2 text-slate-400 border border-slate-700 rounded-lg disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Action</th>
                    <th className="px-5 py-3 text-left">Entity</th>
                    <th className="px-5 py-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                    ))
                  ) : logs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-5 py-3 text-sm text-slate-300">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded text-xs font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400">{log.entity}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {logMeta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50">
                <span className="text-sm text-slate-400">Page {logMeta.page} of {logMeta.totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setLogPage(p => Math.max(1, p - 1))} disabled={!logMeta.hasPreviousPage} className="p-2 text-slate-400 border border-slate-700 rounded-lg disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setLogPage(p => p + 1)} disabled={!logMeta.hasNextPage} className="p-2 text-slate-400 border border-slate-700 rounded-lg disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
