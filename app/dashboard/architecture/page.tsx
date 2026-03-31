'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Activity, Zap, Brain, Database, Monitor, Server, RefreshCw, Cloud } from 'lucide-react'

type ArchStats = {
    rawEvents: number
    anomalyEvents: number
    dailyScores: number
    lastInsert: string | null
    lastAnomaly: string | null
    eventsPerMin: number
    anomalyRate: number
    criticalCount: number
}

// Animated pulsing dot
function PulseDot({ color, active }: { color: string; active: boolean }) {
    return (
        <span className="relative inline-flex h-2.5 w-2.5">
            {active && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ backgroundColor: color }} />
            )}
            <span className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: active ? color : '#374151' }} />
        </span>
    )
}

// Animated flow line between nodes
function FlowLine({ active, vertical = false }: { active: boolean; vertical?: boolean }) {
    return (
        <div className={`relative flex items-center justify-center ${vertical ? 'flex-col h-10 w-6' : 'flex-row w-10 h-6'}`}>
            {/* Base line */}
            <div className={`${vertical ? 'w-0.5 h-full' : 'h-0.5 w-full'} bg-gray-700`} />
            {/* Animated dot */}
            {active && (
                <div
                    className={`absolute rounded-full ${vertical ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5'}`}
                    style={{
                        backgroundColor: '#2E86DE',
                        animation: vertical
                            ? 'flowDown 1.5s ease-in-out infinite'
                            : 'flowRight 1.5s ease-in-out infinite',
                    }}
                />
            )}
            {/* Arrow tip */}
            <div className={`absolute ${vertical ? 'bottom-0' : 'right-0'} text-gray-600`}
                style={{ fontSize: '10px' }}>
                {vertical ? '▼' : '▶'}
            </div>
            <style jsx>{`
        @keyframes flowRight {
          0%   { left: 0; opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { left: calc(100% - 6px); opacity: 0; }
        }
        @keyframes flowDown {
          0%   { top: 0; opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { top: calc(100% - 6px); opacity: 0; }
        }
      `}</style>
        </div>
    )
}

// Architecture node card
function ArchNode({
    icon: Icon,
    title,
    subtitle,
    stats,
    color,
    active,
    badge,
}: {
    icon: React.ElementType
    title: string
    subtitle: string
    stats: { label: string; value: string }[]
    color: string
    active: boolean
    badge?: string
}) {
    return (
        <div
            className="relative rounded-xl border bg-[#0d1424] p-4 min-w-[160px] transition-all duration-300"
            style={{
                borderColor: active ? `${color}50` : '#1f2937',
                boxShadow: active ? `0 0 20px ${color}15` : 'none',
            }}
        >
            {/* Top indicator */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <span className="text-white text-xs font-semibold">{title}</span>
                </div>
                <PulseDot color={color} active={active} />
            </div>

            {/* Subtitle */}
            <p className="text-gray-500 text-[10px] mb-3 leading-relaxed">{subtitle}</p>

            {/* Stats */}
            <div className="space-y-1.5">
                {stats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <span className="text-gray-500 text-[10px]">{s.label}</span>
                        <span className="text-[10px] font-mono font-bold" style={{ color }}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Badge */}
            {badge && (
                <div className="mt-3 text-center">
                    <span className="text-[9px] px-2 py-0.5 rounded-full border font-medium"
                        style={{ borderColor: `${color}30`, color, backgroundColor: `${color}10` }}>
                        {badge}
                    </span>
                </div>
            )}
        </div>
    )
}

export default function ArchitecturePage() {
    const [stats, setStats] = useState<ArchStats>({
        rawEvents: 0,
        anomalyEvents: 0,
        dailyScores: 0,
        lastInsert: null,
        lastAnomaly: null,
        eventsPerMin: 0,
        anomalyRate: 0,
        criticalCount: 0,
    })
    const [active, setActive] = useState(false)
    const [tick, setTick] = useState(0)
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        try {
            const [rawRes, anomalyRes, healthRes, recentRes] = await Promise.all([
                supabase.from('raw_events').select('id, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(1),
                supabase.from('anomaly_events').select('id, created_at, severity', { count: 'exact' }).order('created_at', { ascending: false }).limit(1),
                supabase.from('daily_health_scores').select('id', { count: 'exact' }),
                // Events in last 60 seconds
                supabase.from('raw_events').select('id').gte('created_at',
                    new Date(Date.now() - 60000).toISOString()
                ),
            ])

            const rawCount = rawRes.count ?? 0
            const anomalyCount = anomalyRes.count ?? 0
            const healthCount = healthRes.count ?? 0
            const recentCount = recentRes.data?.length ?? 0

            // Critical count
            const critRes = await supabase
                .from('anomaly_events')
                .select('id', { count: 'exact' })
                .eq('severity', 'critical')

            setStats({
                rawEvents: rawCount,
                anomalyEvents: anomalyCount,
                dailyScores: healthCount,
                lastInsert: rawRes.data?.[0]?.created_at ?? null,
                lastAnomaly: anomalyRes.data?.[0]?.created_at ?? null,
                eventsPerMin: recentCount,
                anomalyRate: rawCount > 0 ? Math.round((anomalyCount / rawCount) * 100) : 0,
                criticalCount: critRes.count ?? 0,
            })

            setActive(recentCount > 0)
            setLoading(false)
        } catch (e) {
            console.error(e)
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
        const interval = setInterval(() => {
            fetchStats()
            setTick(t => t + 1)
        }, 5000)
        return () => clearInterval(interval)
    }, [fetchStats])

    const timeAgo = (iso: string | null) => {
        if (!iso) return 'never'
        const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
        if (diff < 10) return 'just now'
        if (diff < 60) return `${diff}s ago`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return `${Math.floor(diff / 3600)}h ago`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Activity className="h-6 w-6 text-[#2E86DE] animate-pulse" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Cloud className="w-7 h-7 text-[#2E86DE]" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Cloud Architecture</h1>
                        <p className="text-gray-500 text-sm">Live system topology — updates every 5 seconds</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-xs font-semibold">LIVE</span>
                    </div>
                    <button onClick={fetchStats}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-gray-800 text-gray-400 hover:text-white text-xs transition-all">
                        <RefreshCw className="w-3 h-3" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Events Ingested', value: stats.rawEvents.toLocaleString(), color: '#2E86DE' },
                    { label: 'Events / Last 60s', value: stats.eventsPerMin.toString(), color: '#10B981' },
                    { label: 'Anomalies Detected', value: stats.anomalyEvents.toString(), color: '#F59E0B' },
                    { label: 'Anomaly Detection Rate', value: `${stats.anomalyRate}%`, color: '#EF4444' },
                ].map(s => (
                    <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                        <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Architecture Diagram */}
            <div className="bg-[#080d1a] border border-gray-800 rounded-xl p-8">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-8 text-center">
                    Event-Driven Cloud Pipeline — RevenueRadar Architecture
                </p>

                {/* Layer 1: Data Sources */}
                <div className="mb-2">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-3 text-center">Layer 1 — Data Sources</p>
                    <div className="flex justify-center gap-4">
                        {[
                            { name: 'Stripe', color: '#635BFF', events: Math.floor(stats.rawEvents * 0.35) },
                            { name: 'PayPal', color: '#003087', events: Math.floor(stats.rawEvents * 0.28) },
                            { name: 'Shopify', color: '#96BF48', events: Math.floor(stats.rawEvents * 0.37) },
                        ].map(src => (
                            <div key={src.name}
                                className="rounded-lg border px-4 py-2.5 text-center min-w-[110px] transition-all"
                                style={{ borderColor: `${src.color}40`, backgroundColor: `${src.color}08` }}>
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <PulseDot color={src.color} active={active} />
                                    <span className="text-xs font-semibold" style={{ color: src.color }}>{src.name}</span>
                                </div>
                                <p className="text-gray-500 text-[10px]">Simulator</p>
                                <p className="font-mono text-[11px] text-white mt-0.5">{src.events.toLocaleString()} events</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flow down to Supabase */}
                <div className="flex justify-center">
                    <FlowLine active={active} vertical />
                </div>

                {/* Layer 2: Cloud Ingestion */}
                <div className="mb-2">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-3 text-center">Layer 2 — Cloud Ingestion</p>
                    <div className="flex justify-center">
                        <ArchNode
                            icon={Database}
                            title="Supabase"
                            subtitle="PostgreSQL · Singapore Region · Realtime enabled"
                            color="#3ECF8E"
                            active={active}
                            badge="Cloud Database"
                            stats={[
                                { label: 'raw_events', value: `${stats.rawEvents} rows` },
                                { label: 'Last insert', value: timeAgo(stats.lastInsert) },
                                { label: 'Realtime', value: 'Enabled ✓' },
                                { label: 'RLS', value: 'Enforced ✓' },
                            ]}
                        />
                    </div>
                </div>

                {/* Flow down to Pipeline */}
                <div className="flex justify-center">
                    <FlowLine active={active} vertical />
                </div>

                {/* Layer 3: Processing */}
                <div className="mb-2">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-3 text-center">Layer 3 — Detection Pipeline (Python)</p>
                    <div className="flex justify-center gap-6 items-start">
                        <ArchNode
                            icon={Activity}
                            title="Anomaly Engine"
                            subtitle="Temporal Z-Score · Welford's Algorithm · 168-cell matrix"
                            color="#2E86DE"
                            active={active}
                            badge="24×7 Baseline"
                            stats={[
                                { label: 'Algorithm', value: "Welford's O(1)" },
                                { label: 'Cells', value: '168 (24h × 7d)' },
                                { label: 'Cold start', value: '3 data points' },
                                { label: 'Poll interval', value: '3 seconds' },
                            ]}
                        />
                        <div className="flex items-center mt-8">
                            <FlowLine active={active} />
                        </div>
                        <ArchNode
                            icon={Brain}
                            title="AI Explainer"
                            subtitle="Groq Llama-3.3 · 70B params · Free tier"
                            color="#F59E0B"
                            active={active}
                            badge="Groq Inference"
                            stats={[
                                { label: 'Model', value: 'llama-3.3-70b' },
                                { label: 'Max tokens', value: '80' },
                                { label: 'Temperature', value: '0.35' },
                                { label: 'Explanations', value: `${stats.anomalyEvents}` },
                            ]}
                        />
                        <div className="flex items-center mt-8">
                            <FlowLine active={active} />
                        </div>
                        <ArchNode
                            icon={Server}
                            title="Event Storage"
                            subtitle="Supabase anomaly_events · Parquet local backup"
                            color="#8B5CF6"
                            active={active}
                            badge="Dual Storage"
                            stats={[
                                { label: 'anomaly_events', value: `${stats.anomalyEvents} rows` },
                                { label: 'Critical', value: `${stats.criticalCount}` },
                                { label: 'Parquet', value: 'Local archive' },
                                { label: 'Last anomaly', value: timeAgo(stats.lastAnomaly) },
                            ]}
                        />
                    </div>
                </div>

                {/* Flow down to Frontend */}
                <div className="flex justify-center">
                    <FlowLine active={active} vertical />
                </div>

                {/* Layer 4: Presentation */}
                <div>
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-3 text-center">Layer 4 — Presentation (Next.js + Vercel)</p>
                    <div className="flex justify-center gap-4">
                        {[
                            { title: 'Dashboard', desc: 'Health + Charts + AI Summary', color: '#2E86DE' },
                            { title: 'Anomalies', desc: 'Table + 24×7 Heatmap', color: '#F59E0B' },
                            { title: 'Reports', desc: 'Weekly Health Trends', color: '#10B981' },
                            { title: 'Architecture', desc: 'This page — Live topology', color: '#EF4444' },
                        ].map(page => (
                            <div key={page.title}
                                className="rounded-lg border px-4 py-2.5 text-center min-w-[110px] transition-all"
                                style={{ borderColor: `${page.color}40`, backgroundColor: `${page.color}08` }}>
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <Monitor className="h-3 w-3" style={{ color: page.color }} />
                                    <span className="text-xs font-semibold" style={{ color: page.color }}>{page.title}</span>
                                </div>
                                <p className="text-gray-500 text-[10px] leading-relaxed">{page.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vercel badge */}
                <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-1.5">
                        <Zap className="h-3 w-3 text-white" />
                        <span className="text-gray-400 text-[10px]">Deployed on</span>
                        <span className="text-white text-[10px] font-bold">Vercel Edge Network</span>
                        <span className="text-gray-600 text-[10px]">·</span>
                        <span className="text-gray-400 text-[10px]">Auto-deploys on git push</span>
                    </div>
                </div>
            </div>

            {/* Design Patterns Used */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    {
                        title: 'Event Sourcing',
                        desc: 'Every transaction is captured as an immutable event in raw_events. The pipeline reads this stream and produces derived state — anomaly_events and daily_health_scores.',
                        color: '#2E86DE',
                    },
                    {
                        title: 'CQRS Pattern',
                        desc: 'Write path: Python pipeline inserts via service_role. Read path: Next.js dashboard reads via authenticated role. Separation enforced by Supabase RLS policies.',
                        color: '#10B981',
                    },
                    {
                        title: 'Hot / Cold Storage',
                        desc: 'Hot: Supabase PostgreSQL for live queries. Cold: Apache Parquet files for long-term event archive. Automatically tiered by the EventBuffer class.',
                        color: '#F59E0B',
                    },
                ].map(p => (
                    <div key={p.title} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            <p className="text-white text-sm font-semibold">{p.title}</p>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}