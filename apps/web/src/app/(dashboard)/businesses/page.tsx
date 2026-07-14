'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi, exportApi } from '@/lib/api';
import { formatDate, getScoreBg, getPriorityBadge, downloadBlob, truncate } from '@/lib/utils';
import { Search, Filter, Download, Trash2, BarChart3, ChevronLeft, ChevronRight, Eye, Loader2, Building2, User, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const CATEGORIES = [
  '', 'RESTAURANT', 'RETAIL', 'HEALTHCARE', 'BEAUTY_SALON', 'FITNESS',
  'LEGAL', 'REAL_ESTATE', 'AUTOMOTIVE', 'FINANCIAL_SERVICES', 'EDUCATION',
  'CONSULTING', 'CONSTRUCTION', 'HOSPITALITY',
];

const PRIORITIES = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function BusinessesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['businesses', page, search, category, priority, sortBy, sortOrder],
    queryFn: () => businessApi.getAll({ page, limit: 20, search, category, priorityLevel: priority, sortBy, sortOrder }) as any,
  });

  // TransformInterceptor wraps: { success, data: { data: [...], meta: {...} }, timestamp }
  const businesses: any[] = Array.isArray(data?.data?.data) ? data.data.data : [];
  const meta = data?.data?.meta ?? {};

  const deleteMutation = useMutation({
    mutationFn: (id: string) => businessApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({ title: 'Business deleted', variant: 'success' as any });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' }),
  });

  const analyzeMutation = useMutation({
    mutationFn: (id: string) => businessApi.analyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({ title: 'Analysis triggered!', description: 'Scores will update shortly.', variant: 'success' as any });
    },
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const res: any = await exportApi.export({ format: 'CSV', businessIds: selected.length > 0 ? selected : undefined });
      downloadBlob(res, `bizoptics-export-${Date.now()}.csv`);
      toast({ title: 'Export ready!', variant: 'success' as any });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Businesses</h2>
          <p className="text-slate-400 text-sm mt-1">{meta.total ?? 0} businesses in your database</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="text-xs text-slate-400">{selected.length} selected</span>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, city, category..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map(c => (
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={e => { setPriority(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.filter(Boolean).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={e => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order as 'asc' | 'desc');
          }}
          className="px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="rating-desc">Highest Rating</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={e => setSelected(e.target.checked ? businesses.map(b => b.id) : [])}
                    checked={selected.length === businesses.length && businesses.length > 0}
                    className="accent-indigo-600"
                  />
                </th>
                <th className="px-4 py-3 text-left">Business</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Web Score</th>
                <th className="px-4 py-3 text-left">Auto Score</th>
                <th className="px-4 py-3 text-left">AI Score</th>
                <th className="px-4 py-3 text-left">Final</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td colSpan={10} className="px-4 py-3">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No businesses found.</p>
                    <Link href="/search" className="text-indigo-400 text-sm hover:underline mt-1 block">
                      Search for businesses →
                    </Link>
                  </td>
                </tr>
              ) : (
                businesses.map(biz => {
                  const analysis = biz.analyses?.[0];
                  return (
                    <tr key={biz.id} className={selected.includes(biz.id) ? 'bg-indigo-500/5' : ''}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(biz.id)}
                          onChange={() => toggleSelect(biz.id)}
                          className="accent-indigo-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{truncate(biz.name, 28)}</div>
                        {biz.description && (
                          <div className="text-xs text-slate-500 mt-0.5 max-w-[220px] line-clamp-1" title={biz.description}>
                            {biz.description}
                          </div>
                        )}
                        <div className="text-xs text-slate-400 mt-0.5">{biz.city}, {biz.state}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs">
                          {biz.category?.replace(/_/g, ' ')}
                        </span>
                        {Array.isArray(biz.services) && biz.services.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                            <Briefcase className="w-2.5 h-2.5" />
                            {biz.services.length} service{biz.services.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {biz.ownerName ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-[9px] font-bold shrink-0">
                              {biz.ownerName.charAt(0)}
                            </span>
                            <span className="text-xs text-slate-300">{biz.ownerName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                        {biz.foundedYear && (
                          <div className="text-[10px] text-slate-500 mt-0.5">Est. {biz.foundedYear}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{biz.rating ?? '-'} ⭐</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getScoreBg(analysis?.websiteScore ?? 0)}`}>
                          {analysis?.websiteScore ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getScoreBg(analysis?.automationScore ?? 0)}`}>
                          {analysis?.automationScore ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getScoreBg(analysis?.aiScore ?? 0)}`}>
                          {analysis?.aiScore ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-sm font-bold border ${getScoreBg(analysis?.finalScore ?? 0)}`}>
                          {analysis?.finalScore ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {analysis?.priorityLevel ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(analysis.priorityLevel)}`}>
                            {analysis.priorityLevel}
                          </span>
                        ) : <span className="text-slate-500 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/businesses/${biz.id}`} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => analyzeMutation.mutate(biz.id)}
                            disabled={analyzeMutation.isPending}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Analyze"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm('Delete this business?')) deleteMutation.mutate(biz.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
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

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50">
            <span className="text-sm text-slate-400">
              Page {meta.page} of {meta.totalPages} · {meta.total} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPreviousPage}
                className="p-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!meta.hasNextPage}
                className="p-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
