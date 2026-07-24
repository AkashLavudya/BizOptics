'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, getScoreBg, formatDate } from '@/lib/utils';
import { TrendingUp, Building2, BarChart3, Bot, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const AnalyticsCharts = dynamic(() => import('./AnalyticsCharts'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  ),
});

export default function AnalyticsPage() {
  const queryClient = useQueryClient();

  const { data: raw, isLoading } = useQuery({
    queryKey: ['analytics-full'],
    queryFn: () => analyticsApi.getFull() as any,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const resetMutation = useMutation({
    mutationFn: () => analyticsApi.resetAll(),
    onSuccess: () => {
      // Invalidate all related queries to refresh page stats and lists
      queryClient.invalidateQueries({ queryKey: ['analytics-full'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['scan-history'] });
      toast({
        title: 'Database reset successful',
        description: 'All businesses, analyses, recommendations and scan history have been deleted.',
        variant: 'success' as any,
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Reset failed',
        description: err?.response?.data?.message ?? 'Could not clear data.',
        variant: 'destructive',
      });
    },
  });

  const handleReset = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all data? This will permanently delete all businesses, analyses, recommendations, and scan history. This action cannot be undone.'
    );
    if (confirmReset) {
      resetMutation.mutate();
    }
  };

  // Normalise API response — handle both wrapped and unwrapped shapes
  const d = useMemo(() => {
    const payload = raw?.stats ? raw : (raw?.data ?? raw ?? {});
    const s = payload?.stats ?? {};

    return {
      totalBusinesses:        s.totalBusinesses        ?? 0,
      websiteLeads:           s.websiteLeads           ?? 0,
      automationLeads:        s.automationLeads        ?? 0,
      aiLeads:                s.aiLeads                ?? 0,
      combinationLeads:       s.combinationLeads       ?? 0,
      analysisCompletionRate: s.analysisCompletionRate ?? 0,
      // Chart data — already normalised with {label, value} by the API
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
      scoreDistribution: (payload?.scoreDistribution ?? []).map((sd: any) => ({
        label: sd.label ?? '',
        count: sd.value ?? sd.count ?? 0,
      })),
      topOpportunities: (payload?.topOpportunities ?? []).map((t: any) => ({
        id:         t.businessId ?? t.id ?? '',
        name:       t.businessName ?? t.name ?? '—',
        city:       t.city       ?? '',
        state:      t.state      ?? '',
        category:   t.category   ?? '',
        finalScore: t.finalScore ?? 0,
        createdAt:  t.createdAt  ?? null,
      })),
    };
  }, [raw]);

  const statCards = [
    { label: 'Total Businesses',    value: d.totalBusinesses,        icon: Building2,  color: 'bg-indigo-600' },
    { label: 'Completion Rate',     value: `${d.analysisCompletionRate}%`, icon: BarChart3,  color: 'bg-violet-600' },
    { label: 'Website Leads',       value: d.websiteLeads,           icon: TrendingUp, color: 'bg-blue-600'   },
    { label: 'AI Leads',            value: d.aiLeads,                icon: Bot,        color: 'bg-purple-600' },
    { label: 'Automation Leads',    value: d.automationLeads,        icon: BarChart3,  color: 'bg-emerald-600'},
    { label: 'Combo Packages',      value: d.combinationLeads,       icon: TrendingUp, color: 'bg-red-600'    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Platform-wide insights and trends</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetMutation.isPending || d.totalBusinesses === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 hover:border-red-500/40 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        >
          {resetMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          Reset Data
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
            {isLoading ? (
              <><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-16" /></>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{card.value}</div>
                <div className="text-sm text-slate-400 mt-1">{card.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts stats={d} isLoading={isLoading} />

      {/* Top opportunities table */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">Top Scoring Opportunities</h3>
        </div>
        {d.topOpportunities.length === 0 && !isLoading ? (
          <p className="text-slate-400 text-sm text-center py-10">
            No analysed businesses yet. Scan a state and run analyses to populate this table.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Business</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">City</th>
                  <th className="px-5 py-3 text-left">Final Score</th>
                  <th className="px-5 py-3 text-left">Added</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                    ))
                  : d.topOpportunities.slice(0, 10).map((biz: any, i: number) => (
                      <tr
                        key={biz.id}
                        className="cursor-pointer hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-5 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-5 py-3 font-medium">
                          <Link
                            href={`/businesses/${biz.id}`}
                            className="text-white hover:text-indigo-400 transition-colors"
                          >
                            {biz.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs">
                            {biz.category?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-sm">{biz.city}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-sm font-bold border ${getScoreBg(biz.finalScore ?? 0)}`}>
                            {biz.finalScore ?? '-'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-sm">
                          {biz.createdAt ? formatDate(biz.createdAt) : '—'}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
