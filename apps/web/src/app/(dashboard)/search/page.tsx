'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { searchApi, businessApi, exportApi } from '@/lib/api';
import {
  Radar, MapPin, Scan, CheckCircle2, Clock, Trash2, Star, Globe,
  Phone, Building2, Loader2, ChevronRight, Zap, BarChart3, AlertCircle,
  Search, Filter, Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo, downloadBlob } from '@/lib/utils';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
  'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];

const STATE_CITIES: Record<string, string[]> = {
  'Alabama': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'],
  'Alaska': ['Anchorage', 'Juneau', 'Fairbanks', 'Sitka', 'Ketchikan'],
  'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale'],
  'Arkansas': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
  'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
  'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'],
  'Connecticut': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury'],
  'Delaware': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
  'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
  'Georgia': ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon'],
  'Hawaii': ['Honolulu', 'Hilo', 'Kailua', 'Kapolei', 'Kaneohe'],
  'Idaho': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Caldwell'],
  'Illinois': ['Chicago', 'Springfield', 'Naperville', 'Peoria', 'Rockford'],
  'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'],
  'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
  'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka'],
  'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
  'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
  'Maine': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
  'Maryland': ['Baltimore', 'Annapolis', 'Frederick', 'Gaithersburg', 'Rockville'],
  'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell'],
  'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor'],
  'Minnesota': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington'],
  'Mississippi': ['Jackson', 'Gulfport', 'Biloxi', 'Hattiesburg', 'Southaven'],
  'Missouri': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'],
  'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena'],
  'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
  'Nevada': ['Las Vegas', 'Reno', 'Henderson', 'North Las Vegas', 'Sparks'],
  'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Dover'],
  'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Clifton'],
  'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
  'New York': ['New York City', 'Buffalo', 'Albany', 'Rochester', 'Yonkers'],
  'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
  'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
  'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
  'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton'],
  'Oregon': ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro'],
  'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'],
  'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence'],
  'South Carolina': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill'],
  'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
  'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
  'Texas': ['Houston', 'Austin', 'Dallas', 'San Antonio', 'Fort Worth'],
  'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem'],
  'Vermont': ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'],
  'Virginia': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News'],
  'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Bellevue', 'Olympia'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
  'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine'],
  'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs']
};

const SCAN_CATEGORIES_DISPLAY = [
  '🍽️ Restaurants', '🦷 Dental Clinics', '⚖️ Law Offices', '💄 Beauty Salons',
  '🏋️ Fitness Centers', '🏨 Hotels', '🏠 Real Estate', '🚗 Auto Repair',
  '🛍️ Retail Stores', '📊 Accounting', '🏥 Healthcare', '🔨 Construction',
  '🎓 Education', '💼 Consulting', '💊 Pharmacies',
];

function ScanProgress({ active, done, total, categoriesFound }: {
  active: boolean;
  done: boolean;
  total: number;
  categoriesFound: number;
}) {
  const [dots, setDots] = useState('');
  const [pulseIdx, setPulseIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    const p = setInterval(() => setPulseIdx(i => (i + 1) % SCAN_CATEGORIES_DISPLAY.length), 800);
    return () => { clearInterval(t); clearInterval(p); };
  }, [active]);

  if (!active && !done) return null;

  return (
    <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
      {active ? (
        <>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radar className="w-7 h-7 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
            </div>
            <div>
              <div className="text-white font-semibold">Scanning all categories{dots}</div>
              <div className="text-slate-400 text-xs mt-0.5">This may take 15–30 seconds</div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {SCAN_CATEGORIES_DISPLAY.map((cat, i) => (
              <div
                key={cat}
                className={`px-2 py-1.5 rounded-lg text-xs text-center transition-all duration-300 ${
                  i === pulseIdx
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cat}
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
              style={{ width: `${(categoriesFound / 15) * 100}%` }}
            />
          </div>
        </>
      ) : done ? (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
          <div>
            <div className="text-white font-semibold">Scan complete!</div>
            <div className="text-slate-400 text-xs mt-0.5">Found {total} businesses across all categories</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BusinessCard({ biz, onAnalyze, analyzing }: { biz: any; onAnalyze: () => void; analyzing: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor = !biz.finalScore ? 'text-slate-400' :
    biz.finalScore >= 75 ? 'text-emerald-400' :
    biz.finalScore >= 50 ? 'text-blue-400' : 'text-amber-400';

  const scoreBg = !biz.finalScore ? 'bg-slate-800/60' :
    biz.finalScore >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' :
    biz.finalScore >= 50 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-amber-500/10 border-amber-500/20';

  const services: string[] = biz.services ?? [];
  const hasDetails = biz.description || biz.ownerName || services.length > 0 || biz.foundedYear || biz.employeeCount;

  return (
    <div className="bg-slate-900/80 border border-slate-800/50 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col">
      {/* ── Header ── */}
      <div className="p-5 flex flex-col gap-3">
        {/* Name + score */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1">{biz.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{biz.address ? `${biz.address}` : `${biz.city}${biz.state ? `, ${biz.state}` : ''}`}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {biz.rating && (
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{biz.rating}</span>
                <span className="text-slate-500">({biz.reviewCount ?? 0})</span>
              </div>
            )}
            {biz.finalScore && (
              <div className={`px-2 py-0.5 rounded-lg border text-xs font-bold ${scoreBg} ${scoreColor}`}>
                Score: {biz.finalScore}
              </div>
            )}
          </div>
        </div>

        {/* Owner + Founded row */}
        {(biz.ownerName || biz.foundedYear || biz.employeeCount) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {biz.ownerName && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
                <span className="w-4 h-4 rounded-full bg-indigo-600/40 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-[9px] font-bold shrink-0">
                  {biz.ownerName.charAt(0)}
                </span>
                <span className="text-slate-300 font-medium">{biz.ownerName}</span>
                <span className="text-slate-500">· Owner</span>
              </div>
            )}
            {biz.foundedYear && (
              <div className="flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/40">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Est. {biz.foundedYear}</span>
              </div>
            )}
            {biz.employeeCount && (
              <div className="flex items-center gap-1 text-slate-400 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/40">
                <Building2 className="w-3 h-3 shrink-0" />
                <span>{biz.employeeCount} employees</span>
              </div>
            )}
          </div>
        )}

        {/* Quick badge row */}
        <div className="flex flex-wrap gap-1.5">
          {biz.category && (
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-xs">
              {String(biz.category).replace(/_/g, ' ')}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-md text-xs flex items-center gap-1 ${biz.website ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <Globe className="w-2.5 h-2.5" />
            {biz.website ? 'Has Website' : 'No Website'}
          </span>
          {biz.phone && (
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-xs flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" />
              Listed
            </span>
          )}
        </div>

        {/* Expandable toggle */}
        {hasDetails && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors self-start"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
            {expanded ? 'Less details' : 'More details'}
          </button>
        )}
      </div>

      {/* ── Expandable details panel ── */}
      {expanded && hasDetails && (
        <div className="border-t border-slate-800/60 bg-slate-950/50 px-5 py-4 space-y-4">
          {/* Description */}
          {biz.description && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">About</p>
              <p className="text-slate-300 text-xs leading-relaxed">{biz.description}</p>
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Services Offered</p>
              <div className="flex flex-wrap gap-1.5">
                {services.map((svc: string) => (
                  <span
                    key={svc}
                    className="px-2 py-0.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 rounded-full text-[11px]"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact & links */}
          {(biz.phone || biz.website) && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Contact</p>
              <div className="flex flex-col gap-1">
                {biz.phone && (
                  <a href={`tel:${biz.phone}`} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    {biz.phone}
                  </a>
                )}
                {biz.website && (
                  <a href={biz.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors truncate">
                    <Globe className="w-3 h-3 shrink-0" />
                    {biz.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Analyze button ── */}
      <div className="px-5 pb-5 mt-auto">
        <button
          onClick={onAnalyze}
          disabled={analyzing || !biz.id}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 hover:border-indigo-500/40 text-xs font-medium transition-all disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          {analyzing ? 'Analyzing…' : 'Analyze Opportunity'}
        </button>
      </div>
    </div>
  );
}

export default function ScanPage() {
  const queryClient = useQueryClient();
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [scanDone, setScanDone] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Result filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterWebsite, setFilterWebsite] = useState<'all' | 'has' | 'none'>('all');
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [filterSearch, setFilterSearch] = useState('');

  const filteredStates = US_STATES.filter(s =>
    s.toLowerCase().startsWith(stateInput.toLowerCase()) && stateInput.length > 0,
  ).slice(0, 8);

  // Apply result filters
  const filteredResults = results.filter((biz: any) => {
    if (filterCategory && biz.category !== filterCategory) return false;
    if (filterWebsite === 'has' && !biz.website) return false;
    if (filterWebsite === 'none' && biz.website) return false;
    if (filterMinRating > 0 && (biz.rating ?? 0) < filterMinRating) return false;
    if (filterSearch && !biz.name?.toLowerCase().includes(filterSearch.toLowerCase()) &&
        !biz.city?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  const RESULT_CATEGORIES = [...new Set(results.map((b: any) => b.category).filter(Boolean))];

  const { data: historyData } = useQuery<any>({
    queryKey: ['scan-history'],
    queryFn: () => searchApi.getHistory({ limit: 8 }),
  });
  const history: any[] = (historyData as any)?.data?.data ?? [];

  const scanMutation = useMutation({
    mutationFn: (dto: any) => (searchApi as any).scan(dto),
    onSuccess: (res: any) => {
      const businesses = res?.data?.businesses ?? res?.businesses ?? [];
      setResults(businesses);
      setScanDone(true);
      queryClient.invalidateQueries({ queryKey: ['scan-history'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({
        title: `Scan complete — ${businesses.length} businesses found`,
        variant: 'success' as any,
      });
    },
    onError: (err: any) => {
      setScanDone(false);
      toast({
        title: 'Scan failed',
        description: err?.response?.data?.message ?? 'Check server connection',
        variant: 'destructive',
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (id: string) => {
      setAnalyzingId(id);
      return businessApi.analyze(id);
    },
    onSuccess: () => {
      setAnalyzingId(null);
      toast({ title: 'Analysis started!', variant: 'success' as any });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
    onError: () => {
      setAnalyzingId(null);
      toast({ title: 'Analysis failed', variant: 'destructive' });
    },
  });

  const exportMutation = useMutation({
    mutationFn: (ids: string[]) => exportApi.export({ format: 'CSV', businessIds: ids }),
    onSuccess: (blob: any) => {
      const targetState = state || stateInput || 'export';
      const targetCity = city ? `-${city.toLowerCase().replace(/\s+/g, '-')}` : '';
      downloadBlob(blob, `bizoptics-scan-${targetState.toLowerCase().replace(/\s+/g, '-')}${targetCity}-${Date.now()}.csv`);
      toast({ title: 'Export successful!', description: 'Your CSV file has been downloaded.', variant: 'success' as any });
    },
    onError: () => {
      toast({ title: 'Export failed', description: 'Could not export businesses.', variant: 'destructive' });
    },
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: (id: string) => searchApi.deleteHistory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scan-history'] }),
  });

  const handleScan = () => {
    const target = state || stateInput;
    if (!target.trim()) {
      toast({ title: 'Select a state to scan', variant: 'destructive' });
      return;
    }
    if (!city) {
      toast({ title: 'Select a city of that state to scan', variant: 'destructive' });
      return;
    }
    setScanDone(false);
    setResults([]);
    scanMutation.mutate({ state: target.trim(), city, limit: 60 });
  };

  const selectState = (s: string) => {
    setState(s);
    setStateInput(s);
    setCity(''); // Clear city selection when state changes
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const isScanning = scanMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radar className="w-6 h-6 text-indigo-400" />
            Business Scanner
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Auto-scans all 15 business categories in any US state — no manual query needed
          </p>
        </div>
        {results.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            {results.length} businesses discovered
          </div>
        )}
      </div>

      {/* Scanner control panel */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* State selector */}
          <div className="relative">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Target State</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                value={stateInput}
                onChange={e => {
                  setStateInput(e.target.value);
                  setState('');
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleScan();
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                placeholder="e.g. California, Texas, Florida..."
                className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isScanning}
              />
              {showSuggestions && filteredStates.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-xl">
                  {filteredStates.map(s => (
                    <button
                      key={s}
                      onMouseDown={() => selectState(s)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/20 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* City selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Target City</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              disabled={isScanning || !state}
              className="w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">{state ? 'Select City' : 'Select State First'}</option>
              {(state ? STATE_CITIES[state] ?? [] : []).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category badges */}
        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <p className="text-xs text-slate-500 mb-2">Auto-scanning categories:</p>
          <div className="flex flex-wrap gap-1.5">
            {SCAN_CATEGORIES_DISPLAY.map(cat => (
              <span key={cat} className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs">
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Scan button */}
        <div className="mt-4">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 text-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning all categories…
              </>
            ) : (
              <>
                <Scan className="w-4 h-4" />
                Start Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan progress */}
      <ScanProgress
        active={isScanning}
        done={scanDone}
        total={results.length}
        categoriesFound={Math.min(15, Math.ceil((results.length / 8)))}
      />

      {/* Results + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Business results */}
        <div className="lg:col-span-2 space-y-4">
          {isScanning ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              {/* Results header */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  <Building2 className="w-4 h-4 inline mr-1 text-slate-500" />
                  <span className="text-white font-medium">{filteredResults.length}</span>
                  {filteredResults.length !== results.length && <span className="text-slate-500"> of {results.length}</span>} businesses in <span className="text-white font-medium">{state || stateInput}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportMutation.mutate(filteredResults.map((b: any) => b.id).filter(Boolean))}
                    disabled={exportMutation.isPending || filteredResults.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/30 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {exportMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      filteredResults.forEach(biz => {
                        if (biz.id && !biz.finalScore) analyzeMutation.mutate(biz.id);
                      });
                    }}
                    disabled={analyzeMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 border border-violet-500/20 text-violet-400 hover:bg-violet-600/30 rounded-lg text-xs font-medium transition-all"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Analyze All
                  </button>
                </div>
              </div>

              {/* Result filters */}
              <div className="flex flex-wrap gap-2 p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    value={filterSearch}
                    onChange={e => setFilterSearch(e.target.value)}
                    placeholder="Filter by name or city…"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {RESULT_CATEGORIES.map((c: string) => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <select
                  value={filterWebsite}
                  onChange={e => setFilterWebsite(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Sites</option>
                  <option value="has">Has Website</option>
                  <option value="none">No Website</option>
                </select>
                <select
                  value={filterMinRating}
                  onChange={e => setFilterMinRating(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ ⭐</option>
                  <option value={3.5}>3.5+ ⭐</option>
                  <option value={4}>4+ ⭐</option>
                  <option value={4.5}>4.5+ ⭐</option>
                </select>
                {(filterCategory || filterWebsite !== 'all' || filterMinRating > 0 || filterSearch) && (
                  <button
                    onClick={() => { setFilterCategory(''); setFilterWebsite('all'); setFilterMinRating(0); setFilterSearch(''); }}
                    className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {filteredResults.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 border border-slate-800/30 rounded-2xl">
                  <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No businesses match the current filters</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredResults.map((biz: any) => (
                    <BusinessCard
                      key={biz.id || biz.googlePlaceId}
                      biz={biz}
                      analyzing={analyzingId === biz.id}
                      onAnalyze={() => biz.id && analyzeMutation.mutate(biz.id)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : !scanDone ? (
            <div className="text-center py-24 bg-slate-900/40 border border-slate-800/30 rounded-2xl">
              <Radar className="w-14 h-14 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Select a state and start the scan</p>
              <p className="text-slate-600 text-sm mt-1">All 15 business categories will be scanned automatically</p>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/40 border border-slate-800/30 rounded-2xl">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No results returned</p>
              <p className="text-slate-500 text-sm mt-1">Try a different state or wider radius</p>
            </div>
          )}
        </div>

        {/* Scan history */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Scan History
            </h3>
            {history.length === 0 ? (
              <p className="text-slate-500 text-sm">No scans yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((h: any) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 group transition-colors cursor-pointer"
                    onClick={() => {
                      const loc = h.location ?? h.query?.replace('Scan: ', '') ?? '';
                      if (loc) {
                        if (loc.includes(',')) {
                          const parts = loc.split(',').map((p: string) => p.trim());
                          setCity(parts[0]);
                          setState(parts[1]);
                          setStateInput(parts[1]);
                        } else {
                          setState(loc);
                          setStateInput(loc);
                          setCity('');
                        }
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">
                        {h.location ?? h.query?.replace('Scan: ', '')}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{timeAgo(h.createdAt)}</span>
                        {h.resultsCount > 0 && (
                          <span className="text-xs text-indigo-400">{h.resultsCount} found</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={e => { e.stopPropagation(); deleteHistoryMutation.mutate(h.id); }}
                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-slate-900/60 border border-slate-800/30 rounded-2xl p-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">How it works</h4>
            <div className="space-y-2.5">
              {[
                { n: '1', t: 'Choose a US State' },
                { n: '2', t: 'Select a City of that State' },
                { n: '3', t: 'All 15 categories auto-scanned' },
                { n: '4', t: 'Results saved to your database' },
                { n: '5', t: 'Analyze opportunities with AI' },
              ].map(step => (
                <div key={step.n} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                    {step.n}
                  </div>
                  <span className="text-sm text-slate-400">{step.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
