'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface HealthStats {
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
    icon,
}: {
    title: string
    value: string | number
    color?: string
    icon: string
}) {
    return (
        <div
            className="p-5 rounded-xl border border-gray-800"
            style={{ background: '#111827' }}
        >
            <div className="flex justify-between items-start mb-3">
                <span className="text-gray-400 text-sm">{title}</span>
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: color || 'white' }}>
                {value ?? '—'}
            </div>
        </div>
    )
}

function SeverityBadge({ severity }: { severity: string }) {
    const colors: Record<string, { bg: string; text: string }> = {
        critical: { bg: '#7f1d1d', text: '#fca5a5' },
        warning: { bg: '#78350f', text: '#fcd34d' },
        normal: { bg: '#14532d', text: '#86efac' },
    }
    const c = colors[severity] || colors.normal
    return (
        <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ background: c.bg, color: c.text }}
        >
            {severity}
        </span>
    )
}

export default function Dashboard() {
    const [stats, setStats] = useState<HealthStats | null>(null)
    const [events, setEvents] = useState<AnomalyEvent[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchData() {
        try {
            const today = new Date().toISOString().split('T')[0]

            const [healthRes, eventsRes] = await Promise.all([
                supabase
                    .from('daily_health_scores')
                    .select('*')
                    .eq('date', today)
                    .single(),
                supabase
                    .from('anomaly_events')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20),
            ])

            if (healthRes.data) setStats(healthRes.data)
            if (eventsRes.data) setEvents(eventsRes.data)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const score = stats?.health_score ?? 100
    const scoreColor =
        score >= 75 ? '#2ecc71' : score >= 50 ? '#f39c12' : '#e74c3c'

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Real-time revenue anomaly intelligence
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    title="Health Score"
                    value={score.toFixed(1)}
                    color={scoreColor}
                    icon="❤️"
                />
                <MetricCard
                    title="Total Events"
                    value={stats?.total_events ?? 0}
                    color="white"
                    icon="📦"
                />
                <MetricCard
                    title="Anomalies"
                    value={stats?.anomaly_count ?? 0}
                    color="#f39c12"
                    icon="⚠️"
                />
                <MetricCard
                    title="Critical"
                    value={stats?.critical_count ?? 0}
                    color="#e74c3c"
                    icon="🚨"
                />
            </div>

            {/* Live Feed Table */}
            <div
                className="rounded-xl border border-gray-800 overflow-hidden"
                style={{ background: '#111827' }}
            >
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-white font-semibold">Live Anomaly Feed</h2>
                    <span className="text-xs text-gray-500">Auto-refreshes every 30s</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                {['Time', 'Source', 'Amount', 'Severity', 'Z-Score', 'AI Explanation'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-gray-400 font-medium"
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        No anomaly events yet. Pipeline is warming up...
                                    </td>
                                </tr>
                            ) : (
                                events.map((e, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                            {new Date(e.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="px-4 py-3 text-white capitalize">
                                            {e.source}
                                        </td>
                                        <td className="px-4 py-3 text-white">
                                            ₹
                                            {Number(e.amount).toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <SeverityBadge severity={e.severity} />
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {Number(e.z_score).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                                            {e.ai_explanation || '—'}
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