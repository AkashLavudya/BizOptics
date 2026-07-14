'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi, recommendationApi } from '@/lib/api';
import {
  Lightbulb, CheckCircle, Loader2, ArrowRight, Star, Globe,
  MapPin, BarChart3, Zap, Target, Bot, Search,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const CATEGORIES = [
  '', 'RESTAURANT', 'RETAIL', 'HEALTHCARE', 'BEAUTY_SALON', 'FITNESS',
  'LEGAL', 'REAL_ESTATE', 'AUTOMOTIVE', 'FINANCIAL_SERVICES', 'EDUCATION',
  'CONSULTING', 'CONSTRUCTION', 'HOSPITALITY', 'ACCOUNTING',
];

const OPPORTUNITY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'WEBSITE_DEVELOPMENT', label: '🌐 Website Development' },
  { value: 'WORKFLOW_AUTOMATION', label: '⚙️ Workflow Automation' },
  { value: 'AI_AGENT', label: '🤖 AI Agent' },
  { value: 'COMBINATION_PACKAGE', label: '📦 Combination Package' },
  { value: 'SEO_OPTIMIZATION', label: '🔍 SEO Optimization' },
  { value: 'REVIEW_MANAGEMENT', label: '⭐ Review Management' },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  WEBSITE_DEVELOPMENT: <Globe className="w-4 h-4" />,
  WORKFLOW_AUTOMATION: <BarChart3 className="w-4 h-4" />,
  AI_AGENT: <Bot className="w-4 h-4" />,
  COMBINATION_PACKAGE: <Zap className="w-4 h-4" />,
  SEO_OPTIMIZATION: <Search className="w-4 h-4" />,
  REVIEW_MANAGEMENT: <Star className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  WEBSITE_DEVELOPMENT: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  WORKFLOW_AUTOMATION: 'border-violet-500/30 text-violet-400 bg-violet-500/10',
  AI_AGENT: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  COMBINATION_PACKAGE: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  SEO_OPTIMIZATION: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
  REVIEW_MANAGEMENT: 'border-pink-500/30 text-pink-400 bg-pink-500/10',
};

export default function RecommendationsPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [opportunityFilter, setOpportunityFilter] = useState('');
  const [actionedFilter, setActionedFilter] = useState<'all' | 'pending' | 'actioned'>('pending');

  // Fetch businesses with their recommendations (direct relation)
  const { data, isLoading } = useQuery({
    queryKey: ['recommendations-businesses', categoryFilter],
    queryFn: () => businessApi.getAll({
      limit: 200,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...(categoryFilter ? { category: categoryFilter } : {}),
    }) as any,
  });

  // TransformInterceptor: { success, data: { data: [...], meta: {...} } }
  const allBusinesses: any[] = Array.isArray(data?.data?.data) ? data.data.data : [];

  // Only show businesses that have at least one recommendation record
  const businessesWithRecs = allBusinesses.filter((b: any) =>
    Array.isArray(b.recommendations) && b.recommendations.length > 0,
  );

  const actionMutation = useMutation({
    mutationFn: (id: string) => recommendationApi.markActioned(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations-businesses'] });
      toast({ title: 'Marked as actioned!', variant: 'success' as any });
    },
    onError: () => toast({ title: 'Failed to mark actioned', variant: 'destructive' }),
  });

  // Count stats
  const totalRecords = businessesWithRecs.reduce(
    (acc: number, b: any) => acc + (b.recommendations?.length ?? 0), 0,
  );
  const pendingRecords = businessesWithRecs.filter(
    (b: any) => b.recommendations?.some((r: any) => !r.isActioned),
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Recommendations</h2>
          <p className="text-slate-400 text-sm mt-1">AI-generated action plans for your top opportunities</p>
        </div>
        {!isLoading && businessesWithRecs.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
              {pendingRecords} pending
            </div>
            <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400">
              {totalRecords} total
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-800/60 border border-slate-700 rounded-xl">
          {(['all', 'pending', 'actioned'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActionedFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                actionedFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map(c => (
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select
          value={opportunityFilter}
          onChange={e => setOpportunityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {OPPORTUNITY_TYPES.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : businessesWithRecs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-slate-800/30 rounded-2xl">
          <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-2 font-medium">No recommendations yet</p>
          <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
            Go to the Scanner, scan a state, then click <strong className="text-slate-300">"Analyze Opportunity"</strong> on any business card to generate AI recommendations.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Target className="w-4 h-4" />
            Go to Scanner
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {businessesWithRecs.map((biz: any) => {
            // Each biz.recommendations[] entry has a .recommendations JSON field
            // which is the array of recommendation items
            const recRecords: any[] = biz.recommendations ?? [];

            // Flatten all items across all recommendation records
            const allItems: Array<{ item: any; record: any }> = [];
            recRecords.forEach((record: any) => {
              const items: any[] = Array.isArray(record.recommendations)
                ? record.recommendations
                : [];
              items.forEach(item => allItems.push({ item, record }));
            });

            // Apply filters
            const filtered = allItems.filter(({ item, record }) => {
              if (opportunityFilter && item.type !== opportunityFilter) return false;
              if (actionedFilter === 'pending' && record.isActioned) return false;
              if (actionedFilter === 'actioned' && !record.isActioned) return false;
              return true;
            });

            if (filtered.length === 0) return null;

            return (
              <div key={biz.id} className="bg-slate-900/80 border border-slate-800/50 rounded-2xl overflow-hidden">
                {/* Business header */}
                <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/businesses/${biz.id}`}
                        className="font-semibold text-white hover:text-indigo-300 transition-colors block truncate"
                      >
                        {biz.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{biz.city}, {biz.state}</span>
                        <span className="px-1.5 py-0.5 bg-slate-800 rounded-md">{biz.category?.replace(/_/g, ' ')}</span>
                        {biz.rating && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{biz.rating}</span>}
                        {biz.website
                          ? <span className="text-emerald-400 flex items-center gap-1"><Globe className="w-3 h-3" />Has Website</span>
                          : <span className="text-red-400 flex items-center gap-1"><Globe className="w-3 h-3" />No Website</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500">{filtered.length} rec{filtered.length !== 1 ? 's' : ''}</span>
                    <Link href={`/businesses/${biz.id}`} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Recommendation cards */}
                <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(({ item, record }, idx) => {
                    const typeColor = TYPE_COLORS[item.type] ?? 'border-slate-500/30 text-slate-400 bg-slate-500/10';
                    const typeIcon = TYPE_ICONS[item.type] ?? <Target className="w-4 h-4" />;
                    const isActioned = record.isActioned;

                    return (
                      <div
                        key={`${record.id}-${idx}`}
                        className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
                          isActioned
                            ? 'opacity-60 bg-slate-800/20 border-slate-700/30'
                            : 'bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/30'
                        }`}
                      >
                        {/* Type badge */}
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${typeColor}`}>
                            {typeIcon}
                            {item.type?.replace(/_/g, ' ')}
                          </span>
                          {isActioned && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1.5 leading-tight">{item.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
                        </div>

                        {/* Impact */}
                        {item.estimatedImpact && (
                          <div className="px-2.5 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                            <p className="text-xs text-emerald-400 font-medium line-clamp-2">{item.estimatedImpact}</p>
                          </div>
                        )}

                        {/* Timeline */}
                        {item.estimatedTimeToImplement && (
                          <p className="text-xs text-slate-500">⏱ {item.estimatedTimeToImplement}</p>
                        )}

                        {/* Action */}
                        <div className="mt-auto">
                          {!isActioned ? (
                            <button
                              onClick={() => actionMutation.mutate(record.id)}
                              disabled={actionMutation.isPending}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-lg text-xs font-medium transition-colors"
                            >
                              {actionMutation.isPending
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <CheckCircle className="w-3 h-3" />
                              }
                              Mark Actioned
                            </button>
                          ) : (
                            <div className="text-center text-xs text-emerald-400 flex items-center justify-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Actioned
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
