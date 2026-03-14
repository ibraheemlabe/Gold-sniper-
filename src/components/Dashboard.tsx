import React, { useEffect, useState, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  Globe, 
  DollarSign, 
  ShieldAlert,
  ExternalLink,
  Info,
  Clock,
  Zap,
  Calendar,
  History,
  Lightbulb,
  Target,
  Rocket,
  CheckCircle2,
  Sparkles,
  Crosshair,
  AlertTriangle,
  Newspaper,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { fetchGoldFundamentals, type GoldFundamentalData, type DimensionData, type PricePoint } from '../services/geminiService';
import { cn } from '../lib/utils';

const REFRESH_INTERVAL = 300; // 5 minutes in seconds

const BiasBadge = ({ bias }: { bias: GoldFundamentalData['bias'] }) => {
  const configs = {
    BULLISH: { icon: TrendingUp, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'BULLISH' },
    BEARISH: { icon: TrendingDown, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', label: 'BEARISH' },
    NEUTRAL: { icon: Minus, color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20', label: 'NEUTRAL' },
  };

  const { icon: Icon, color, label } = configs[bias] || configs.NEUTRAL;

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider", color)}>
      <Icon size={12} />
      {label}
    </div>
  );
};

const ImpactItem = ({ label, content, icon: Icon, color }: { label: string, content: string, icon: any, color: string }) => (
  <div className="flex flex-col gap-1 p-2 bg-zinc-800/20 rounded-lg border border-zinc-800/50">
    <div className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider", color)}>
      <Icon size={10} />
      {label}
    </div>
    <p className="text-[10px] text-zinc-400 leading-tight font-medium">{content}</p>
  </div>
);

const DataCard = ({ title, data, icon: Icon }: { title: string, data: DimensionData, icon: any }) => (
  <div className="group relative bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl hover:border-zinc-700/80 transition-all duration-300 flex flex-col h-full overflow-hidden">
    <div className="absolute -right-6 -top-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
      <Icon size={140} />
    </div>
    
    <div className="flex items-center gap-3 mb-4 relative z-10">
      <div className="p-2 bg-zinc-800/80 rounded-xl group-hover:bg-zinc-700 transition-colors shadow-sm">
        <Icon size={16} className="text-zinc-300" />
      </div>
      <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">{title}</h3>
    </div>

    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mb-4 flex items-start gap-2.5 relative z-10">
      <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
      <p className="text-[11px] italic text-amber-200/70 leading-relaxed">
        {data.metaphor}
      </p>
    </div>
    
    <div className="prose prose-invert prose-xs max-w-none text-zinc-400 leading-relaxed mb-6 flex-grow relative z-10 font-medium">
      <ReactMarkdown>{data.analysis}</ReactMarkdown>
    </div>

    <div className="grid grid-cols-2 gap-2 relative z-10">
      <ImpactItem label="Now" content={data.impact?.immediate || ''} icon={Zap} color="text-amber-400" />
      <ImpactItem label="Days" content={data.impact?.shortTerm || ''} icon={Clock} color="text-blue-400" />
      <ImpactItem label="Months" content={data.impact?.mediumTerm || ''} icon={Calendar} color="text-purple-400" />
      <ImpactItem label="Years" content={data.impact?.longTerm || ''} icon={History} color="text-emerald-400" />
    </div>
  </div>
);

const TrendChart = ({ title, data, color }: { title: string, data: PricePoint[], color: string }) => (
  <div className="bg-zinc-900/20 border border-zinc-800/40 p-4 rounded-2xl h-[200px] flex flex-col">
    <div className="flex justify-between items-center mb-3">
      <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{title}</h4>
      <span className="text-[10px] font-mono text-zinc-600">XAU/USD</span>
    </div>
    <div className="flex-grow">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              stroke="#3f3f46" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              hide 
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
              labelStyle={{ color: '#71717a', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#gradient-${title})`} 
              strokeWidth={2}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-[10px] text-zinc-600 uppercase tracking-widest">
          No Data
        </div>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<GoldFundamentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGoldFundamentals();
      setData(result);
      setCountdown(REFRESH_INTERVAL);
    } catch (err) {
      setError('Failed to fetch market data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      loadData();
      setCountdown(REFRESH_INTERVAL);
    }
  }, [countdown, loadData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-24 font-sans selection:bg-amber-500/30">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-zinc-800/50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shadow-inner">
              <Crosshair className="text-amber-500" size={18} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase flex items-center gap-1.5">
                Sniper <span className="text-amber-500">Gold</span>
              </h1>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                <Clock size={8} />
                <span>Refresh in {formatTime(countdown)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data && <BiasBadge bias={data.bias} />}
            <button 
              onClick={loadData}
              disabled={loading}
              className="w-9 h-9 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
            >
              <RefreshCw size={14} className={cn("text-zinc-400", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="relative">
              <div className="w-14 h-14 border-2 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-amber-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-zinc-100 font-bold text-xs uppercase tracking-[0.3em]">Locking Targets</p>
              <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest">Scanning Global Markets...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl flex items-center gap-4 text-rose-400 shadow-sm">
            <AlertTriangle size={20} />
            <p className="text-xs font-bold">{error}</p>
            <button onClick={loadData} className="ml-auto text-[10px] font-black uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg">Retry</button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Sniper Intel & Levels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-6 rounded-3xl relative overflow-hidden shadow-xl shadow-amber-900/5">
                <div className="absolute -right-10 -bottom-10 opacity-5">
                  <Info size={200} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Sniper Intel</h2>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{data.lastUpdated}</span>
                  </div>
                  <p className="text-lg md:text-xl text-zinc-100 font-bold leading-tight tracking-tight">
                    {data.summary}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/80 p-5 rounded-3xl flex flex-col justify-between gap-4 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 animate-pulse">
                    <RefreshCw size={8} />
                    CME SYNC
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  <Crosshair size={12} className="text-amber-500" />
                  CME Scalp Zones
                </div>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Resistance (Call OI)</p>
                      <div className="flex flex-col gap-1.5">
                        {data.scalperLevels?.resistance?.map((lvl, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <span className="w-fit px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[11px] font-mono font-black">
                              {lvl.level}
                            </span>
                            <p className="text-[9px] text-zinc-500 leading-tight italic">{lvl.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="py-2.5 border-y border-zinc-800/50 flex justify-between items-center">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Pivot</p>
                      <span className="text-amber-500 font-mono font-black text-base">{data.scalperLevels?.pivot}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Support (Put OI)</p>
                      <div className="flex flex-col gap-1.5">
                        {data.scalperLevels?.support?.map((lvl, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <span className="w-fit px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[11px] font-mono font-black">
                              {lvl.level}
                            </span>
                            <p className="text-[9px] text-zinc-500 leading-tight italic">{lvl.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                {data.cmeData && (
                  <div className="pt-2 border-t border-zinc-800/50 space-y-2">
                    <div>
                      <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Top OI Strikes</p>
                      <div className="flex flex-wrap gap-1">
                        {data.cmeData.highOIStrikes.map((s, i) => (
                          <div key={i} className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-[8px] font-mono text-zinc-400 border border-zinc-700/50">
                            <span className={s.type === 'CALL' ? 'text-rose-400' : 'text-emerald-400'}>{s.type}</span> {s.strike} ({s.oi}) <span className="text-[7px] opacity-50">{s.expiration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {data.cmeData.contractExpirations && (
                      <div>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Contract Expirations</p>
                        <div className="flex flex-wrap gap-1">
                          {data.cmeData.contractExpirations.map((c, i) => (
                            <div key={i} className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-[8px] font-mono text-zinc-400 border border-zinc-700/50">
                              <span className="text-amber-500">{c.code}</span>: {c.dte} DTE @ {c.price}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Historical Trends - Mobile Grid */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                <History size={12} className="text-blue-500" />
                Price History
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TrendChart title="Past Week" data={data.historicalTrends.week} color="#f59e0b" />
                <TrendChart title="Past Month" data={data.historicalTrends.month} color="#3b82f6" />
                <TrendChart title="Past Year" data={data.historicalTrends.year} color="#10b981" />
              </div>
            </section>

            {/* News & Strategy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  <Newspaper size={12} className="text-amber-500" />
                  Events to Watch
                </div>
                  <div className="space-y-3">
                    {data.newsToWatch?.map((news, i) => (
                      <div key={i} className="flex items-start gap-3.5 p-3.5 bg-zinc-800/30 rounded-2xl border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors group">
                      <div className={cn(
                        "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                        news.importance === 'HIGH' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 
                        news.importance === 'MEDIUM' ? 'bg-amber-500' : 'bg-zinc-500'
                      )} />
                      <div className="space-y-1 flex-grow">
                        <div className="flex justify-between items-start">
                          <p className="text-[13px] font-black text-zinc-100 leading-tight">{news.title}</p>
                          <span className="text-[9px] font-bold text-zinc-500 font-mono uppercase tracking-tighter">{news.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium leading-snug">{news.impact}</p>
                      </div>
                      <ChevronRight size={12} className="text-zinc-700 group-hover:text-zinc-500 transition-colors self-center" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-center shadow-lg shadow-indigo-900/5">
                <div className="absolute -right-6 -top-6 opacity-[0.03]">
                  <Sparkles size={160} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                    <Rocket size={12} />
                    Mentor Strategy
                  </div>
                  <p className="text-base md:text-lg text-zinc-100 leading-snug italic font-bold tracking-tight">
                    "{data.mentorAdvice}"
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['Wyckoff Logic', 'Murphy Principles', 'Scalp Mode'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Fundamental Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DataCard title="Money Rules" data={data.macro} icon={Globe} />
              <DataCard title="Dollar & Rates" data={data.yields} icon={DollarSign} />
              <DataCard title="Global Mood" data={data.sentiment} icon={ShieldAlert} />
            </div>

            {/* Mission Plan */}
            <section className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Target className="text-emerald-500" size={18} />
                </div>
                <div>
                  <h2 className="text-xs font-black text-zinc-100 uppercase tracking-[0.2em]">Sniper Mission Plan</h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">#moneywise 💰</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-zinc-800/40 p-5 rounded-2xl border border-zinc-700/30">
                    <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">The Objective</h3>
                    <p className="text-base text-zinc-100 font-bold leading-tight">{data.goalPlan?.goal || ''}</p>
                  </div>
                    <div className="space-y-3">
                      <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Action Steps</h3>
                      {data.goalPlan?.steps?.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                        <div className="mt-1 shrink-0">
                          <CheckCircle2 size={14} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[13px] text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors leading-tight">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-center bg-zinc-800/20 p-6 rounded-2xl border border-dashed border-zinc-800">
                  <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Motivation</h3>
                  <p className="text-zinc-200 leading-tight font-bold italic text-base">
                    "{data.goalPlan?.motivation || ''}"
                  </p>
                </div>
              </div>
            </section>

                {data.sources?.length > 0 && (
                  <section className="pt-6 border-t border-zinc-800/50">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                      <Globe size={12} />
                      Grounding Sources
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {data.sources?.map((source, i) => (
                        <a 
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-xl hover:bg-zinc-800/40 transition-all group active:scale-95"
                    >
                      <span className="text-[10px] font-bold text-zinc-500 truncate pr-3 group-hover:text-zinc-300 transition-colors">{source.title}</span>
                      <ExternalLink size={10} className="text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : null}
      </main>

      <footer className="mt-12 py-8 border-t border-zinc-900/50 text-center">
        <p className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.4em]">
          Gemini 3 Flash • Sniper Mode • #moneywise 💰
        </p>
      </footer>
    </div>
  );
}
