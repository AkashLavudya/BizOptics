'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { businessApi } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Globe, Phone, Mail, MapPin, Star, CheckCircle, XCircle, BarChart3, Loader2, User, Users, Briefcase, Clock, Building2 } from 'lucide-react';
import Link from 'next/link';
import { getScoreBg, getPriorityBadge } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

function ScoreRing({ score, label, size = 80 }: { score: number; label: string; size?: number }) {
  const radius = (size / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#3b82f6' : score >= 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90" suppressHydrationWarning>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={6} suppressHydrationWarning />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
          suppressHydrationWarning
        />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="white" fontSize={16} fontWeight="bold" className="rotate-90 origin-center" style={{ transform: 'rotate(90deg)', transformBox: 'fill-box' }} suppressHydrationWarning>
          {score}
        </text>
      </svg>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}


function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/50 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      {value ? (
        <CheckCircle className="w-5 h-5 text-emerald-400" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400" />
      )}
    </div>
  );
}

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: () => businessApi.getById(id) as any,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => businessApi.analyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', id] });
      toast({ title: 'Analysis complete!', description: 'Scores have been updated.', variant: 'success' as any });
    },
    onError: () => toast({ title: 'Analysis failed', variant: 'destructive' }),
  });

  const biz = data?.data;
  const analysis = biz?.analyses?.[0];
  const recommendations = biz?.recommendations ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Business not found.</p>
        <Link href="/businesses" className="text-indigo-400 hover:underline">← Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-2xl font-bold text-white">{biz.name}</h2>
          <p className="text-slate-400 text-sm mt-1">{biz.address}, {biz.city}, {biz.state}</p>
          {biz.ownerName && (
            <div className="flex items-center gap-2 mt-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/40 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold">
                {biz.ownerName.charAt(0)}
              </span>
              <span className="text-slate-300 text-sm">{biz.ownerName}</span>
              <span className="text-slate-500 text-xs">· Owner</span>
              {biz.foundedYear && <span className="text-slate-500 text-xs ml-1">· Est. {biz.foundedYear}</span>}
              {biz.employeeCount && <span className="text-slate-500 text-xs">· {biz.employeeCount} employees</span>}
            </div>
          )}
        </div>
        <button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
        >
          {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          Re-analyze
        </button>
      </div>

      {/* About + Services panel */}
      {(biz.description || (biz.services && biz.services.length > 0)) && (
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 space-y-5">
          {biz.description && (
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                About This Business
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{biz.description}</p>
            </div>
          )}
          {biz.services && biz.services.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Services Offered
              </h3>
              <div className="flex flex-wrap gap-2">
                {biz.services.map((svc: string) => (
                  <span
                    key={svc}
                    className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 rounded-full text-sm"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score overview */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-around gap-6">
          <ScoreRing score={analysis?.websiteScore ?? 0} label="Website" />
          <ScoreRing score={analysis?.automationScore ?? 0} label="Automation" />
          <ScoreRing score={analysis?.aiScore ?? 0} label="AI Agent" />
          <ScoreRing score={analysis?.finalScore ?? 0} label="Final Score" size={100} />
          {analysis?.priorityLevel && (
            <div className="text-center">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getPriorityBadge(analysis.priorityLevel)}`}>
                {analysis.priorityLevel}
              </span>
              <div className="text-xs text-slate-400 mt-2">Priority Level</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800/60">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations ({recommendations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-white">Contact Information</h3>
              {biz.phone && (
                <a href={`tel:${biz.phone}`} className="flex items-center gap-3 text-slate-300 hover:text-white text-sm">
                  <Phone className="w-4 h-4 text-slate-500" /> {biz.phone}
                </a>
              )}
              {biz.email && (
                <a href={`mailto:${biz.email}`} className="flex items-center gap-3 text-slate-300 hover:text-white text-sm">
                  <Mail className="w-4 h-4 text-slate-500" /> {biz.email}
                </a>
              )}
              {biz.website && (
                <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 text-sm">
                  <Globe className="w-4 h-4" /> {biz.website}
                </a>
              )}
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <MapPin className="w-4 h-4 text-slate-500" /> {biz.address}, {biz.city}, {biz.state}, {biz.country}
              </div>
              {biz.rating && (
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {biz.rating} ({biz.reviewCount} reviews)
                </div>
              )}
            </div>
            <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Business Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="text-slate-200">{biz.category?.replace(/_/g, ' ')}</span>
                </div>
                {biz.ownerName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Owner</span>
                    <span className="text-slate-200">{biz.ownerName}</span>
                  </div>
                )}
                {biz.foundedYear && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Founded</span>
                    <span className="text-slate-200">{biz.foundedYear}</span>
                  </div>
                )}
                {biz.employeeCount && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Employees</span>
                    <span className="text-slate-200">{biz.employeeCount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Has Website</span>
                  <span className={biz.website ? 'text-emerald-400' : 'text-red-400'}>{biz.website ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Google Place ID</span>
                  <span className="text-slate-400 text-xs font-mono">{biz.googlePlaceId?.slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Analyses Run</span>
                  <span className="text-slate-200">{biz.analyses?.length ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          {!analysis ? (
            <div className="text-center py-12 bg-slate-900/80 border border-slate-800/50 rounded-2xl">
              <p className="text-slate-400 mb-4">No analysis yet.</p>
              <button onClick={() => analyzeMutation.mutate()} className="px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-500">
                Run Analysis
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {/* Website */}
              <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center justify-between">
                  Website Analysis
                  <span className={`text-sm px-2 py-0.5 rounded-full border ${getScoreBg(analysis.websiteScore)}`}>{analysis.websiteScore}</span>
                </h3>
                {analysis.websiteData && (
                  <>
                    <BoolRow label="Has Website" value={analysis.websiteData.hasWebsite} />
                    <BoolRow label="HTTPS Secure" value={analysis.websiteData.hasHttps} />
                    <BoolRow label="Contact Page" value={analysis.websiteData.hasContactPage} />
                    <BoolRow label="Booking/Appointment" value={analysis.websiteData.hasBookingPage} />
                    <BoolRow label="Mobile Optimized" value={analysis.websiteData.isMobileOptimized} />
                    <BoolRow label="Analytics Installed" value={analysis.websiteData.hasAnalytics} />
                    <BoolRow label="Social Proof" value={analysis.websiteData.hasSocialProof} />
                  </>
                )}
              </div>
              {/* Automation */}
              <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center justify-between">
                  Automation Gaps
                  <span className={`text-sm px-2 py-0.5 rounded-full border ${getScoreBg(analysis.automationScore)}`}>{analysis.automationScore}</span>
                </h3>
                {analysis.automationData && (
                  <>
                    <BoolRow label="Appointment Booking" value={analysis.automationData.needsAppointmentBooking} />
                    <BoolRow label="Lead Management" value={analysis.automationData.needsLeadManagement} />
                    <BoolRow label="Inventory Management" value={analysis.automationData.needsInventoryManagement} />
                    <BoolRow label="Customer Follow-up" value={analysis.automationData.needsCustomerFollowUp} />
                    <BoolRow label="Invoicing" value={analysis.automationData.needsInvoicing} />
                    <BoolRow label="Reporting" value={analysis.automationData.needsReporting} />
                  </>
                )}
              </div>
              {/* AI */}
              <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center justify-between">
                  AI Agent Opportunities
                  <span className={`text-sm px-2 py-0.5 rounded-full border ${getScoreBg(analysis.aiScore)}`}>{analysis.aiScore}</span>
                </h3>
                {analysis.aiAgentData && (
                  <>
                    <BoolRow label="Customer Support Bot" value={analysis.aiAgentData.needsCustomerSupport} />
                    <BoolRow label="FAQ Automation" value={analysis.aiAgentData.needsFaqAutomation} />
                    <BoolRow label="Lead Qualification" value={analysis.aiAgentData.needsLeadQualification} />
                    <BoolRow label="Appointment Bot" value={analysis.aiAgentData.needsAppointmentBot} />
                    <BoolRow label="Review Management" value={analysis.aiAgentData.needsReviewManagement} />
                  </>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {recommendations.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/80 border border-slate-800/50 rounded-2xl">
              <p className="text-slate-400">No recommendations yet. Run an analysis first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec: any) => (
                <div key={rec.id} className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{rec.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityBadge(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    {rec.totalEstimatedValue && (
                      <span className="text-emerald-400 font-bold text-sm whitespace-nowrap">{rec.totalEstimatedValue}</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-4">{rec.description}</p>
                  {rec.actionItems?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase mb-2">Action Items</h4>
                      <ul className="space-y-1.5">
                        {rec.actionItems.map((item: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center shrink-0">{i+1}</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
