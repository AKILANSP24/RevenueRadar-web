'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import { Activity, AlertTriangle, ShieldAlert, HeartPulse, RefreshCcw, TrendingUp } from 'lucide-react'

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
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

    async function fetchData() {
        try {
            // Fetch past 14 days of health scores for the trend line
            const [healthRes, eventsRes] = await Promise.all([
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
            ])

            if (healthRes.data && healthRes.data.length > 0) {
                setHealthHistory(healthRes.data)
                // Use the most recent day's score for the cards
                setStats(healthRes.data[healthRes.data.length - 1])
            }
            if (eventsRes.data) setEvents(eventsRes.data)
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
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#111827] px-3 py-1.5 rounded-lg border border-gray-800 shadow-sm">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    title="Health Score"
                    value={score.toFixed(1)}
                    color={scoreColor}
                    icon={HeartPulse}
                    subtitle="System revenue health coefficient"
                />
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

            {/* Charts Section */}
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

            {/* Live Feed Table */}
            <div className="rounded-xl border border-gray-800 bg-[#111827] shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#111827]">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <h2 className="text-white font-semibold">Live Anomaly Feed</h2>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                        Top {events.length} recent
                    </span>
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
                                            <div className="text-gray-300 truncate">
                                                {e.ai_explanation || 'Atypical pattern detected'}
                                            </div>
                                            <div className="text-gray-500 text-xs mt-0.5">
                                                Z-Score: <span className={e.z_score > 3 ? 'text-red-400' : 'text-gray-400'}>{Number(e.z_score).toFixed(2)}</span>
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