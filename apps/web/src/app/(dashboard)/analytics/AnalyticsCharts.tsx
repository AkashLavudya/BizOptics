'use client';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6'];

interface Props {
  stats: any;
  isLoading: boolean;
}

export default function AnalyticsCharts({ stats, isLoading }: Props) {
  return (
    <div className="space-y-6">
      {/* Trends line chart */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-5">Discovery Trends (30 days)</h3>
        {isLoading ? (
          <Skeleton className="h-52 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.trends ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Businesses" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie + Bar charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">Opportunities by Type</h3>
          {isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats?.opportunitiesByType ?? []}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="type"
                >
                  {(stats?.opportunitiesByType ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">Businesses by Category</h3>
          {isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={(stats?.byCategory ?? []).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tickFormatter={(v: string) => v.replace(/_/g, ' ')}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
