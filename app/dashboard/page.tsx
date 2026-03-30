'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, BarChart, Bar
} from 'recharts'
import { Activity, AlertTriangle, ShieldAlert, HeartPulse, RefreshCcw, TrendingUp, BrainCircuit, BarChart2, Info, Target, Network } from 'lucide-react'

interface HealthStats {
    date: string
    health_score: number
    total_events: number
    anomaly_count: number
    critical_count: number
}

interface AnomalyEvent {
    id: string
    timestamp: string
    source: string
    amount: number
    severity: 'critical' | 'warning' | 'normal'
    z_score: number
    ai_explanation: string | null
}

function MetricCard({
    title,
    value,
    color,
    icon: Icon,
    subtitle
}: {
    title: string
    value: string | number
    color: string
    icon: React.ElementType
    subtitle?: string
}) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Icon className="h-24 w-24" />
            </div>
            <div className="flex justify-between items-start mb-4">
                <span className="text-gray-400 text-sm font-medium">{title}</span>
                <div className="rounded-lg p-2" style={{ backgroundColor: `${color}15`, color }}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
                {value ?? '—'}
            </div>
            {subtitle && (
                <div className="text-xs text-gray-500 mt-2">
                    {subtitle}
                </div>
            )}
        </div>
    )
}

function SeverityBadge({ severity }: { severity: string }) {
    const colors: Record<string, { bg: string; text: string; dot: string }> = {
        critical: { bg: 'rgba(231, 76, 60, 0.15)', text: '#e74c3c', dot: '#e74c3c' },
        warning: { bg: 'rgba(243, 156, 18, 0.15)', text: '#fcd34d', dot: '#f39c12' },
        normal: { bg: 'rgba(46, 204, 113, 0.15)', text: '#2ecc71', dot: '#2ecc71' },
    }
    const c = colors[severity] || colors.normal
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: c.bg, color: c.text }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </span>
    )
}

export default function Dashboard() {
    const [stats, setStats] = useState<HealthStats | null>(null)
    const [healthHistory, setHealthHistory] = useState<HealthStats[]>([])
    const [events, setEvents] = useState<AnomalyEvent[]>([])
    const [aiInsights, setAiInsights] = useState<AnomalyEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

    async function fetchData() {
        try {
            // Fetch past 14 days of health scores, feed events, and the AI panel events
            const [healthRes, eventsRes, aiRes] = await Promise.all([
                supabase
                    .from('daily_health_scores')
                    .select('*')
                    .order('date', { ascending: true })
                    .limit(14),
                supabase
                    .from('anomaly_events')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20),
                supabase
                    .from('anomaly_events')
                    .select('*')
                    .not('ai_explanation', 'is', null)
                    .in('severity', ['critical', 'warning'])
                    .order('created_at', { ascending: false })
                    .limit(5)
            ])

            if (healthRes.data && healthRes.data.length > 0) {
                setHealthHistory(healthRes.data)
                setStats(healthRes.data[healthRes.data.length - 1])
            }
            if (eventsRes.data) setEvents(eventsRes.data)
            if (aiRes.data) setAiInsights(aiRes.data)
            
            setLastRefresh(new Date())
        } catch (e) {
            console.error('Error fetching dashboard data:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const score = stats?.health_score ?? 100
    const scoreColor = score >= 80 ? '#10B981' : score >= 50 ? '#f39c12' : '#e74c3c'

    // Compute derived data for the severity Pie Chart
    const severityData = useMemo(() => {
        const counts = { critical: 0, warning: 0, normal: 0 }
        events.forEach(e => {
            if (counts[e.severity as keyof typeof counts] !== undefined) {
                counts[e.severity as keyof typeof counts]++
            }
        })
        
        return [
            { name: 'Critical', value: counts.critical, color: '#e74c3c' },
            { name: 'Warning', value: counts.warning, color: '#f39c12' },
            { name: 'Normal', value: counts.normal, color: '#10B981' }
        ].filter(d => d.value > 0)
    }, [events])

    // Compute derived data for the Source Risk Bar Chart
    const sourceData = useMemo(() => {
        const counts: Record<string, number> = {}
        events.forEach(e => {
            counts[e.source] = (counts[e.source] || 0) + 1
        })
        const brandColors: Record<string, string> = {
            'stripe': '#635BFF',
            'paypal': '#003087',
            'shopify': '#96BF48',
        }
        return Object.entries(counts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            fill: brandColors[name.toLowerCase()] || '#2E86DE'
        })).sort((a, b) => b.value - a.value)
    }, [events])

    const exportCSV = () => {
        if (events.length === 0) return;
        const headers = ['timestamp', 'source', 'amount', 'severity', 'z_score', 'ai_explanation'];
        const csvRows = [headers.join(',')];
        
        events.forEach(e => {
            const explanation = e.ai_explanation ? `"${e.ai_explanation.replace(/"/g, '""')}"` : '""';
            csvRows.push(`${e.timestamp},${e.source},${e.amount},${e.severity},${e.z_score},${explanation}`);
        });
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `anomaly_events_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <Activity className="h-8 w-8 text-[#2E86DE] animate-pulse" />
                <div className="text-gray-400 tracking-wide text-sm font-medium">Initializing Dashboard...</div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Overview</h1>
                    <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-2">
                        Real-time AI anomaly intelligence
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 shadow-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex h-full w-full rounded-full bg-green-500"></span>
                        </span>
                        LIVE
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#111827] px-3 py-1.5 rounded-lg border border-gray-800 shadow-sm">
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Visual Health Gauge */}
                <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg flex flex-col justify-center items-center">
                    <span className="flex items-center justify-between w-full">
                        <span className="text-gray-400 text-sm font-medium w-full text-left">Health Score</span>
                        <div className="rounded-lg p-2" style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}>
                            <HeartPulse className="h-5 w-5" />
                        </div>
                    </span>
                    <div className="h-28 w-full relative flex justify-center items-center -mb-4 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                                cx="50%" 
                                cy="50%" 
                                innerRadius="75%" 
                                outerRadius="100%" 
                                barSize={10} 
                                data={[{ name: 'Score', value: score, fill: scoreColor }]} 
                                startAngle={180} 
                                endAngle={0}
                            >
                                <RadialBar background={{ fill: '#374151' }} cornerRadius={10} dataKey="value" />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center top-[40%]">
                            <span className="text-3xl font-bold text-white leading-none">{score.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                <MetricCard
                    title="Analyzed Events"
                    value={stats?.total_events?.toLocaleString() ?? 0}
                    color="#2E86DE"
                    icon={Activity}
                    subtitle="Total transactions parsed today"
                />
                <MetricCard
                    title="Flagged Anomalies"
                    value={stats?.anomaly_count?.toLocaleString() ?? 0}
                    color="#f39c12"
                    icon={AlertTriangle}
                    subtitle="Deviations requiring attention"
                />
                <MetricCard
                    title="Critical Alerts"
                    value={stats?.critical_count?.toLocaleString() ?? 0}
                    color="#e74c3c"
                    icon={ShieldAlert}
                    subtitle="High severity anomalies"
                />
            </div>

            {/* Main Data Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="h-5 w-5 text-[#2E86DE]" />
                        <h2 className="text-white font-semibold flex-1">Health Score Trend</h2>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={healthHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2E86DE" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2E86DE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#9CA3AF" 
                                    fontSize={12} 
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return `${d.getMonth()+1}/${d.getDate()}`;
                                    }}
                                />
                                <YAxis 
                                    stroke="#9CA3AF" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    domain={[0, 100]}
                                />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="health_score" 
                                    stroke="#2E86DE" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorScore)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Severity Donut */}
                <div className="rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg flex flex-col">
                    <h2 className="text-white font-semibold mb-2">Anomaly Severity Ratio</h2>
                    <p className="text-gray-400 text-sm mb-6">Based on recent flagged events</p>
                    
                    <div className="flex-1 min-h-[220px]">
                        {severityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#E5E7EB' }}
                                    />
                                    <Legend verticalAlign="bottom" height={20} wrapperStyle={{ fontSize: '13px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                Not enough data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {/* Source Risk Profile */}
                <div className="rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart2 className="h-5 w-5 text-[#2E86DE]" />
                        <h2 className="text-white font-semibold flex-1">Source Risk Profile</h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">Anomaly frequency by payment processor</p>
                    
                    <div className="flex-1 min-h-[220px]">
                        {sourceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                    <RechartsTooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#E5E7EB' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                Not enough data
                            </div>
                        )}
                    </div>
                </div>

                {/* Detection Methodology */}
                <div className="rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <Info className="h-5 w-5 text-[#2E86DE]" />
                        <h2 className="text-white font-semibold flex-1">Detection Methodology</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="flex gap-3 items-start">
                            <div className="mt-0.5 p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400"><Activity className="h-4 w-4" /></div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-200">Temporal Baseline Z-Score</h3>
                                <p className="text-xs text-gray-400 mt-1">Statistical deviation mapped against a dynamically adjusting context-aware rolling average.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="mt-0.5 p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400"><Network className="h-4 w-4" /></div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-200">Multi-Source Correlation</h3>
                                <p className="text-xs text-gray-400 mt-1">Cross-registers gateway behaviors to separate global platform outages from localized incidents.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="mt-0.5 p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><BrainCircuit className="h-4 w-4" /></div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-200">AI-Powered Explanation</h3>
                                <p className="text-xs text-gray-400 mt-1">Generates human-readable context leveraging Groq inferences to pinpoint pattern origins.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="mt-0.5 p-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400"><Target className="h-4 w-4" /></div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-200">Pattern Velocity Tracking</h3>
                                <p className="text-xs text-gray-400 mt-1">Monitors the acceleration of transactional anomalies to predict incoming high-impact incidents.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Intelligence Summary */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <BrainCircuit className="h-5 w-5 text-[#2E86DE]" />
                    <h2 className="text-white font-semibold text-lg tracking-tight">AI Intelligence Summary</h2>
                </div>
                {aiInsights.length === 0 ? (
                    <div className="rounded-xl border border-gray-800 bg-[#111827] p-8 shadow-lg text-center flex flex-col items-center gap-3">
                        <BrainCircuit className="h-8 w-8 text-gray-600" />
                        <p className="text-gray-400">AI explanations generate when pipeline detects anomalies. Start the Python simulator to see insights here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiInsights.map((insight, i) => (
                            <div 
                                key={i} 
                                className={`rounded-xl border border-gray-800 bg-[#111827] p-5 shadow-lg flex flex-col justify-between border-l-4 ${insight.severity === 'critical' ? 'border-l-[#e74c3c]' : 'border-l-[#f39c12]'}`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="flex items-center gap-2 text-white font-medium capitalize text-sm">
                                                {insight.source}
                                            </span>
                                            <span className="text-gray-500 text-xs mt-0.5">
                                                {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(insight.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={`text-xs font-bold px-2 py-1 rounded-md border ${insight.severity === 'critical' ? 'bg-[#e74c3c]/10 text-[#e74c3c] border-[#e74c3c]/20' : 'bg-[#f39c12]/10 text-[#f39c12] border-[#f39c12]/20'}`}>
                                            Z: {Number(insight.z_score).toFixed(2)}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed tracking-wide italic">
                                        "{insight.ai_explanation}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Live Feed Table */}
            <div className="rounded-xl border border-gray-800 bg-[#111827] shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#111827]">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <h2 className="text-white font-semibold">Live Anomaly Feed</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={exportCSV} 
                            disabled={events.length === 0}
                            className="text-xs text-white bg-[#2E86DE] hover:bg-[#2573c4] px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Export CSV
                        </button>
                        <span className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                            Top {events.length} recent
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#0a0f1e]/50">
                            <tr className="border-b border-gray-800">
                                {['Time', 'Source', 'Analysis', 'Impact', 'Severity'].map((h) => (
                                    <th key={h} className="px-6 py-4 text-left text-gray-400 font-medium tracking-wider text-xs uppercase">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShieldAlert className="h-8 w-8 text-gray-700" />
                                            <span>No anomaly events detected recently.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                events.map((e, i) => (
                                    <tr key={i} className="hover:bg-[#1a2333] transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-300 font-medium">
                                                {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-gray-500 text-xs mt-0.5">
                                                {new Date(e.timestamp).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                                    {e.source.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-white capitalize font-medium">{e.source}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-gray-300 truncate cursor-help" title={e.ai_explanation || 'Atypical pattern detected'}>
                                                {e.ai_explanation || 'Atypical pattern detected'}
                                            </div>
                                            <div className="text-gray-500 text-xs mt-0.5">
                                                Z-Score: <span className={e.z_score >= 4 ? 'text-red-500 font-bold' : e.z_score >= 2 ? 'text-orange-500 font-bold' : 'text-green-500 font-bold'}>{Number(e.z_score).toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-200 font-medium">
                                                ₹{Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <SeverityBadge severity={e.severity} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}