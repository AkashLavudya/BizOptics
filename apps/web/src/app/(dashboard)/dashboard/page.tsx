'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Building2, Globe, Cpu, Bot, ArrowUpRight } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
        <Skeleton className="h-4 w-48 mb-5" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
        <Skeleton className="h-4 w-36 mb-5" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  ),
});

function StatCard({ title, value, change, icon: Icon, color, loading }: any) {
  if (loading) {
    return (
      <div className="stat-card">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }
  return (
    <div className="stat-card border-slate-800/50 bg-slate-900/80">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      <div className="text-sm text-slate-400">{title}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <ArrowUpRight className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(change)}% this week
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const firstName = useAuthStore(s => s.user?.firstName);
  const { data: raw, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getFull() as any,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // The axios interceptor returns response.data, so raw IS the payload directly.
  // API shape: { stats: {...}, businessesByCategory: [...], opportunitiesByType: [...],
  //             trendsOverTime: [...], topOpportunities: [...] }
  // Normalise all field names here so nothing leaks into child components.
  const d = useMemo(() => {
    // Handle both wrapped ({ data: {...} }) and unwrapped shapes defensively
    const payload = raw?.stats ? raw : (raw?.data ?? raw ?? {});
    const s = payload?.stats ?? {};

    return {
      totalBusinesses:  s.totalBusinesses   ?? 0,
      websiteLeads:     s.websiteLeads      ?? 0,
      automationLeads:  s.automationLeads   ?? 0,
      aiLeads:          s.aiLeads           ?? 0,
      // Chart data — normalise key names that differ between service and page
      trends: (payload?.trendsOverTime ?? []).map((t: any) => ({
        date:  t.date  ?? t.label ?? '',
        count: t.value ?? t.count ?? 0,
      })),
      byCategory: (payload?.businessesByCategory ?? []).map((c: any) => ({
        category: c.label ?? c.category ?? '',
        count:    c.value ?? c.count    ?? 0,
      })),
      opportunitiesByType: (payload?.opportunitiesByType ?? []).map((o: any) => ({
        type:  o.label ?? o.type  ?? '',
        count: o.value ?? o.count ?? 0,
      })),
      topOpportunities: (payload?.topOpportunities ?? []).map((t: any) => ({
        id:         t.businessId ?? t.id ?? '',
        name:       t.businessName ?? t.name ?? '—',
        city:       t.city  ?? '',
        state:      t.state ?? '',
        category:   t.category ?? '',
        finalScore: t.finalScore ?? 0,
      })),
    };
  }, [raw]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {greeting}, {firstName}! 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {formatDate(new Date())} · Here&apos;s what&apos;s happening today
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25"
        >
          + Scan Businesses
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Businesses" value={d.totalBusinesses} icon={Building2} color="bg-indigo-600" loading={isLoading} change={12} />
        <StatCard title="Website Leads"    value={d.websiteLeads}    icon={Globe}     color="bg-blue-600"   loading={isLoading} change={8}  />
        <StatCard title="Automation Leads" value={d.automationLeads} icon={Cpu}       color="bg-violet-600" loading={isLoading} change={15} />
        <StatCard title="AI Agent Leads"   value={d.aiLeads}         icon={Bot}       color="bg-purple-600" loading={isLoading} change={22} />
      </div>

      {/* Charts */}
      <DashboardCharts stats={d} isLoading={isLoading} />

      {/* Top Opportunities */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">Top Opportunities</h3>
          <Link href="/businesses" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : d.topOpportunities.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            No analysed businesses yet — scan a state, then click &ldquo;Analyze Opportunity&rdquo; on any result.
          </p>
        ) : (
          <div className="space-y-2">
            {d.topOpportunities.slice(0, 5).map((biz: any) => (
              <Link
                key={biz.id}
                href={`/businesses/${biz.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
              >
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {biz.name}
                  </div>
                  <div className="text-xs text-slate-400">{biz.city}{biz.state ? `, ${biz.state}` : ''}</div>
                </div>
                <div className={`text-lg font-bold tabular-nums ${
                  biz.finalScore >= 75 ? 'text-emerald-400' :
                  biz.finalScore >= 50 ? 'text-blue-400' : 'text-amber-400'
                }`}>
                  {biz.finalScore}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
