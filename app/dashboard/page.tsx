'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, BarChart, Bar
} from 'recharts'
import {
    Activity, ShieldAlert, HeartPulse, RefreshCcw, TrendingUp,
    BrainCircuit, BarChart2, Target, Network, AlertTriangle,
    TrendingDown, Clock, Zap, Shield
} from 'lucide-react'

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
    baseline_mean: number
    baseline_std: number
    ai_explanation: string | null
}

// ─── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ title, value, color, icon: Icon, subtitle }: {
    title: string; value: string | number; color: string
    icon: React.ElementType; subtitle?: string
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
            <div className="text-3xl font-bold text-white mb-1">{value ?? '—'}</div>
            {subtitle && <div className="text-xs text-gray-500 mt-2">{subtitle}</div>}
        </div>
    )
}

// ─── Severity Badge ──────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
    const colors: Record<string, { bg: string; text: string; dot: string }> = {
        critical: { bg: 'rgba(231, 76, 60, 0.15)', text: '#e74c3c', dot: '#e74c3c' },
        warning: { bg: 'rgba(243, 156, 18, 0.15)', text: '#fcd34d', dot: '#f39c12' },
        normal: { bg: 'rgba(46, 204, 113, 0.15)', text: '#2ecc71', dot: '#2ecc71' },
    }
    const c = colors[severity] || colors.normal
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: c.bg, color: c.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </span>
    )
}

// ─── AI Intelligence Summary ─────────────────────────────────────────────────
function AIIntelligenceSummary({ insights, allEvents }: {
    insights: AnomalyEvent[]
    allEvents: AnomalyEvent[]
}) {
    // Compute cumulative stats per source from all events
    const sourceStats = useMemo(() => {
        const stats: Record<string, { count: number; critical: number; warning: number; totalZ: number }> = {}
        allEvents.forEach(e => {
            if (!stats[e.source]) stats[e.source] = { count: 0, critical: 0, warning: 0, totalZ: 0 }
            stats[e.source].count++
            if (e.severity === 'critical') stats[e.source].critical++
            if (e.severity === 'warning') stats[e.source].warning++
            stats[e.source].totalZ += Math.abs(e.z_score)
        })
        return stats
    }, [allEvents])

    // Detect burst pattern: 3+ anomalies in last 10 minutes
    const burstSources = useMemo(() => {
        const now = Date.now()
        const tenMinAgo = now - 10 * 60 * 1000
        const recent: Record<string, number> = {}
        allEvents.forEach(e => {
            const t = new Date(e.timestamp).getTime()
            if (t >= tenMinAgo) {
                recent[e.source] = (recent[e.source] || 0) + 1
            }
        })
        return Object.entries(recent).filter(([, c]) => c >= 3).map(([s]) => s)
    }, [allEvents])

    // Detect cross-source: multiple sources flagged within 2 min of each other
    const crossSourceAlert = useMemo(() => {
        const twoMin = 2 * 60 * 1000
        const sorted = [...allEvents].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        for (let i = 0; i < sorted.length - 1; i++) {
            const t1 = new Date(sorted[i].timestamp).getTime()
            const t2 = new Date(sorted[i + 1].timestamp).getTime()
            if (sorted[i].source !== sorted[i + 1].source && Math.abs(t1 - t2) <= twoMin) {
                return { src1: sorted[i].source, src2: sorted[i + 1].source }
            }
        }
        return null
    }, [allEvents])

    if (insights.length === 0) {
        return (
            <div className="rounded-xl border border-gray-800 bg-[#111827] p-8 shadow-lg text-center flex flex-col items-center gap-3">
                <BrainCircuit className="h-8 w-8 text-gray-600" />
                <p className="text-gray-400">AI explanations generate when pipeline detects anomalies. Start the Python simulator to see insights here.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">

            {/* ── Alert banners ── */}
            {crossSourceAlert && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-4">
                    <Zap className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-red-400 font-semibold text-sm">Cross-source attack pattern detected</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                            <span className="capitalize font-medium text-white">{crossSourceAlert.src1}</span> and{' '}
                            <span className="capitalize font-medium text-white">{crossSourceAlert.src2}</span> both
                            flagged within 2 minutes — investigate for coordinated fraud or system-wide event.
                        </p>
                    </div>
                </div>
            )}

            {burstSources.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/5 px-5 py-4">
                    <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-orange-400 font-semibold text-sm">Burst pattern detected</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                            <span className="capitalize font-medium text-white">{burstSources.join(', ')}</span> — 3 or more anomalies in the last 10 minutes.
                            This indicates a potential automated attack or system spike. Immediate review recommended.
                        </p>
                    </div>
                </div>
            )}

            {/* ── AI insight cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, i) => {
                    const src = sourceStats[insight.source]
                    const avgZ = src ? (src.totalZ / src.count).toFixed(2) : '—'
                    const riskLevel = src?.critical > 2 ? 'HIGH' : src?.critical > 0 ? 'ELEVATED' : 'MODERATE'
                    const riskColor = riskLevel === 'HIGH' ? '#e74c3c' : riskLevel === 'ELEVATED' ? '#f39c12' : '#2E86DE'
                    const deviation = insight.baseline_mean > 0
                        ? ((insight.amount - insight.baseline_mean) / insight.baseline_mean * 100).toFixed(0)
                        : null
                    const isBurst = burstSources.includes(insight.source)

                    return (
                        <div
                            key={i}
                            className={`rounded-xl border border-gray-800 bg-[#111827] p-5 shadow-lg flex flex-col gap-3 border-l-4 ${insight.severity === 'critical' ? 'border-l-[#e74c3c]' : 'border-l-[#f39c12]'}`}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-semibold capitalize text-sm">{insight.source}</span>
                                        {isBurst && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">BURST</span>
                                        )}
                                    </div>
                                    <span className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {' • '}
                                        {new Date(insight.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded-md border ${insight.severity === 'critical'
                                    ? 'bg-[#e74c3c]/10 text-[#e74c3c] border-[#e74c3c]/20'
                                    : 'bg-[#f39c12]/10 text-[#f39c12] border-[#f39c12]/20'}`}>
                                    Z: {Number(insight.z_score).toFixed(2)}σ
                                </div>
                            </div>

                            {/* AI explanation */}
                            <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-gray-700 pl-3">
                                {insight.ai_explanation}
                            </p>

                            {/* Contextual stats row */}
                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-800">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Session flags</p>
                                    <p className="text-white text-sm font-bold mt-0.5">{src?.count ?? 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Avg Z</p>
                                    <p className="text-white text-sm font-bold mt-0.5">{avgZ}σ</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Source risk</p>
                                    <p className="text-sm font-bold mt-0.5" style={{ color: riskColor }}>{riskLevel}</p>
                                </div>
                            </div>

                            {/* Deviation from baseline */}
                            {deviation && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900/50 rounded-lg px-3 py-2">
                                    <TrendingUp className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                    <span>
                                        Amount is <span className="text-red-400 font-semibold">{Math.abs(Number(deviation))}% {Number(deviation) > 0 ? 'above' : 'below'}</span> baseline mean
                                        of ₹{Number(insight.baseline_mean).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
    const [stats, setStats] = useState<HealthStats | null>(null)
    const [healthHistory, setHealthHistory] = useState<HealthStats[]>([])
    const [events, setEvents] = useState<AnomalyEvent[]>([])
    const [aiInsights, setAiInsights] = useState<AnomalyEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

    async function fetchData() {
        try {
            const [healthRes, eventsRes, aiRes] = await Promise.all([
                supabase.from('daily_health_scores').select('*').order('date', { ascending: true }).limit(14),
                supabase.from('anomaly_events').select('*').order('created_at', { ascending: false }).limit(50),
                supabase.from('anomaly_events').select('*')
                    .not('ai_explanation', 'is', null)
                    .in('severity', ['critical', 'warning'])
                    .order('created_at', { ascending: false }).limit(6)
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

    const severityData = useMemo(() => {
        const counts = { critical: 0, warning: 0, normal: 0 }
        events.forEach(e => {
            if (counts[e.severity as keyof typeof counts] !== undefined)
                counts[e.severity as keyof typeof counts]++
        })
        return [
            { name: 'Critical', value: counts.critical, color: '#e74c3c' },
            { name: 'Warning', value: counts.warning, color: '#f39c12' },
            { name: 'Normal', value: counts.normal, color: '#10B981' },
        ].filter(d => d.value > 0)
    }, [events])

    const sourceRiskData = useMemo(() => {
        const counts: Record<string, number> = {}
        events.forEach(e => { counts[e.source] = (counts[e.source] || 0) + 1 })
        const colorMap: Record<string, string> = { stripe: '#635BFF', paypal: '#003087', shopify: '#96BF48' }
        return Object.entries(counts).map(([source, count]) => ({
            source: source.charAt(0).toUpperCase() + source.slice(1),
            count,
            fill: colorMap[source] || '#2E86DE'
        }))
    }, [events])

    const exportCSV = () => {
        if (events.length === 0) return
        const headers = ['timestamp', 'source', 'amount', 'severity', 'z_score', 'ai_explanation']
        const csvRows = [headers.join(',')]
        events.forEach(e => {
            const explanation = e.ai_explanation ? `"${e.ai_explanation.replace(/"/g, '""')}"` : '""'
            csvRows.push(`${e.timestamp},${e.source},${e.amount},${e.severity},${e.z_score},${explanation}`)
        })
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `anomaly_events_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

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

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Overview</h1>
                    <p className="text-gray-400 text-sm mt-1.5">Real-time AI anomaly intelligence</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-xs font-semibold">LIVE</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#111827] px-3 py-1.5 rounded-lg border border-gray-800">
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Health Score Gauge */}
                <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg col-span-1">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-gray-400 text-sm font-medium">Health Score</span>
                        <div className="rounded-lg p-2" style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}>
                            <HeartPulse className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={120}>
                            <RadialBarChart cx="50%" cy="80%" innerRadius="60%" outerRadius="90%"
                                startAngle={180} endAngle={0} data={[{ value: score, fill: scoreColor }]}>
                                <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#1f2937' }} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center -mt-8">
                        <span className="text-3xl font-bold" style={{ color: scoreColor }}>{score.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm"> /100</span>
                    </div>
                </div>
                <MetricCard title="Analyzed Events" value={stats?.total_events ?? 0} color="#2E86DE"
                    icon={Activity} subtitle="Total transactions parsed today" />
                <MetricCard title="Flagged Anomalies" value={stats?.anomaly_count ?? 0} color="#f39c12"
                    icon={AlertTriangle} subtitle="Deviations requiring attention" />
                <MetricCard title="Critical Alerts" value={stats?.critical_count ?? 0} color="#e74c3c"
                    icon={ShieldAlert} subtitle="High severity anomalies" />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Health Trend */}
                <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg">
                    <h2 className="text-white font-semibold mb-1">Health Score Trend</h2>
                    <p className="text-gray-400 text-sm mb-4">Last {healthHistory.length} days</p>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={healthHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2E86DE" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2E86DE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
                                    tickFormatter={(val) => { const d = new Date(val); return `${d.getMonth() + 1}/${d.getDate()}` }} />
                                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }} labelStyle={{ color: '#9CA3AF' }} />
                                <Area type="monotone" dataKey="health_score" stroke="#2E86DE" strokeWidth={2.5}
                                    fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Severity Donut */}
                <div className="rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg flex flex-col">
                    <h2 className="text-white font-semibold mb-1">Anomaly Severity Ratio</h2>
                    <p className="text-gray-400 text-sm mb-4">Based on recent flagged events</p>
                    <div className="flex-1 min-h-[200px]">
                        {severityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={85}
                                        paddingAngle={4} dataKey="value" stroke="none">
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#E5E7EB' }} />
                                    <Legend verticalAlign="bottom" height={20} wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">Not enough data</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Source Risk + Detection Methodology ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Source Risk */}
                <div className="rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart2 className="h-4 w-4 text-[#2E86DE]" />
                        <h2 className="text-white font-semibold">Source Risk Profile</h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Anomaly frequency by payment processor</p>
                    <div className="h-[160px]">
                        {sourceRiskData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceRiskData} layout="vertical" margin={{ left: 0, right: 16 }}>
                                    <XAxis type="number" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="source" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={60} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#E5E7EB' }} />
                                    <Bar dataKey="count" name="Anomalies" radius={[0, 4, 4, 0]}>
                                        {sourceRiskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data yet</div>
                        )}
                    </div>
                </div>

                {/* Detection Methodology */}
                <div className="rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-4 w-4 text-[#2E86DE]" />
                        <h2 className="text-white font-semibold">Detection Methodology</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { icon: <Activity className="h-4 w-4" />, color: 'blue', title: 'Temporal Baseline Z-Score', desc: 'Statistical deviation mapped against a dynamically adjusting context-aware rolling average.' },
                            { icon: <Network className="h-4 w-4" />, color: 'purple', title: 'Multi-Source Correlation', desc: 'Cross-registers gateway behaviors to separate global platform outages from localized incidents.' },
                            { icon: <BrainCircuit className="h-4 w-4" />, color: 'emerald', title: 'AI-Powered Explanation', desc: 'Generates human-readable context leveraging Groq inferences to pinpoint pattern origins.' },
                            { icon: <Target className="h-4 w-4" />, color: 'orange', title: 'Pattern Velocity Tracking', desc: 'Monitors the acceleration of transactional anomalies to predict incoming high-impact incidents.' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className={`mt-0.5 p-1.5 rounded-md bg-${item.color}-500/10 border border-${item.color}-500/20 text-${item.color}-400`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-200">{item.title}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── AI Intelligence Summary ── */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <BrainCircuit className="h-5 w-5 text-[#2E86DE]" />
                    <h2 className="text-white font-semibold text-lg tracking-tight">AI Intelligence Summary</h2>
                </div>
                <AIIntelligenceSummary insights={aiInsights} allEvents={events} />
            </div>

            {/* ── Live Feed Table ── */}
            <div className="rounded-xl border border-gray-800 bg-[#111827] shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <h2 className="text-white font-semibold">Live Anomaly Feed</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={exportCSV} disabled={events.length === 0}
                            className="text-xs text-white bg-[#2E86DE] hover:bg-[#2573c4] px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer">
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
                                    <th key={h} className="px-6 py-4 text-left text-gray-400 font-medium tracking-wider text-xs uppercase">{h}</th>
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
                                            <div className="text-gray-500 text-xs mt-0.5">{new Date(e.timestamp).toLocaleDateString()}</div>
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
                                                Z-Score: <span className={e.z_score >= 4 ? 'text-red-500 font-bold' : e.z_score >= 2 ? 'text-orange-500 font-bold' : 'text-green-500 font-bold'}>
                                                    {Number(e.z_score).toFixed(2)}
                                                </span>
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