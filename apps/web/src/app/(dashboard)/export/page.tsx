'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { exportApi } from '@/lib/api';
import { Download, FileText, FileSpreadsheet, File, Loader2, CheckCircle } from 'lucide-react';
import { downloadBlob } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const formats = [
  {
    id: 'CSV',
    label: 'CSV',
    description: 'Spreadsheet-compatible. Works with Excel, Google Sheets, and any data tool.',
    icon: FileSpreadsheet,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    id: 'EXCEL',
    label: 'Excel',
    description: 'Formatted .xlsx file with color-coded scores, multiple sheets, and filters.',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    id: 'PDF',
    label: 'PDF Report',
    description: 'Professional PDF report ready to share with clients or your team.',
    icon: File,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
];

const exts: Record<string, string> = { CSV: 'csv', EXCEL: 'xlsx', PDF: 'pdf' };

export default function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'EXCEL' | 'PDF'>('CSV');
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const exportMutation = useMutation({
    mutationFn: async (format: string) => {
      const res: any = await exportApi.export({ format });
      return { data: res, format };
    },
    onSuccess: ({ data, format }) => {
      const filename = `bizoptics-export-${Date.now()}.${exts[format]}`;
      downloadBlob(data, filename);
      setDownloaded(format);
      setTimeout(() => setDownloaded(null), 3000);
      toast({ title: `${format} exported successfully!`, variant: 'success' as any });
    },
    onError: () => toast({ title: 'Export failed', variant: 'destructive' }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Export Data</h2>
        <p className="text-slate-400 text-sm mt-1">Download your business data and reports</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {formats.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFormat(f.id as any)}
            className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
              selectedFormat === f.id
                ? `${f.bg} ${f.border} shadow-lg`
                : 'bg-slate-900/80 border-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
              <f.icon className={`w-6 h-6 ${f.color}`} />
            </div>
            <h3 className="font-semibold text-white mb-2">{f.label}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
          </button>
        ))}
      </div>

      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Export Options</h3>
        <div className="space-y-3 text-sm text-slate-400 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            All businesses in your database
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Latest analysis scores for each business
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Top recommendations per business
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Priority levels and opportunity types
          </div>
        </div>

        <button
          onClick={() => exportMutation.mutate(selectedFormat)}
          disabled={exportMutation.isPending}
          className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25"
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : downloaded ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exportMutation.isPending
            ? 'Generating...'
            : downloaded
            ? 'Downloaded!'
            : `Download ${selectedFormat}`}
        </button>
      </div>

      {/* Quick exports */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Quick Exports</h3>
        <div className="flex flex-wrap gap-3">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => exportMutation.mutate(f.id)}
              disabled={exportMutation.isPending}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${f.bg} ${f.border} ${f.color} hover:opacity-80`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
