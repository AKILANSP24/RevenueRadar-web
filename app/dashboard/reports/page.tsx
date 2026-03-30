'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart2, TrendingUp, TrendingDown, Download, AlertCircle, CheckCircle } from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

type DailyScore = {
    id: string
    date: string
    health_score: number
    total_events: number
    anomaly_count: number
    critical_count: number
    created_at: string
}

const HEALTH_COLOR = (score: number) => {
    if (score >= 75) return '#10B981'
    if (score >= 50) return '#F59E0B'
    return '#EF4444'
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-[#111827] border border-gray-700 rounded-lg p-3 text-xs">
                <p className="text-gray-400 mb-1">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }} className="font-semibold">
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function ReportsPage() {
    const [data, setData] = useState<DailyScore[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            const { data: rows, error } = await supabase
                .from('daily_health_scores')
                .select('*')
                .order('date', { ascending: true })
                .limit(30)
            if (!error && rows) setData(rows)
            setLoading(false)
        }
        fetch()
    }, [])

    const exportCSV = () => {
        const header = 'Date,Health Score,Total Events,Anomalies,Critical'
        const rows = data.map(d => `${d.date},${d.health_score},${d.total_events},${d.anomaly_count},${d.critical_count}`)
        const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `health_report_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Weekly summaries
    const weeks: { label: string; days: DailyScore[] }[] = []
    for (let i = 0; i < data.length; i += 7) {
        const chunk = data.slice(i, i + 7)
        const start = chunk[0]?.date
        const end = chunk[chunk.length - 1]?.date
        weeks.push({ label: `${start} → ${end}`, days: chunk })
    }

    const avgScore = data.length
        ? Math.round(data.reduce((s, d) => s + d.health_score, 0) / data.length)
        : 0

    const totalEvents = data.reduce((s, d) => s + d.total_events, 0)
    const totalAnomalies = data.reduce((s, d) => s + d.anomaly_count, 0)
    const totalCritical = data.reduce((s, d) => s + d.critical_count, 0)

    const latest = data[data.length - 1]
    const prev = data[data.length - 2]
    const trend = latest && prev ? latest.health_score - prev.health_score : 0

    const chartData = data.map(d => ({
        date: d.date.slice(5),
        score: d.health_score,
        anomalies: d.anomaly_count,
        critical: d.critical_count,
        events: d.total_events,
    }))

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BarChart2 className="w-7 h-7 text-[#2E86DE]" />
                    <h1 className="text-2xl font-bold text-white">Reports</h1>
                </div>
                <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E86DE] text-white hover:bg-[#2E86DE]/80 transition-all text-sm font-medium"
                >
                    <Download className="w-4 h-4" />
                    Export Health Report
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-500">Loading report data...</div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2 bg-[#111827] border border-gray-800 rounded-xl">
                    <BarChart2 className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No report data yet. Run the Python pipeline to generate health scores.</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Avg Health Score',
                                value: avgScore,
                                unit: '/100',
                                icon: <CheckCircle className="w-5 h-5" />,
                                color: HEALTH_COLOR(avgScore),
                                sub: trend >= 0
                                    ? <span className="flex items-center gap-1 text-green-400"><TrendingUp className="w-3 h-3" />+{trend} vs prev day</span>
                                    : <span className="flex items-center gap-1 text-red-400"><TrendingDown className="w-3 h-3" />{trend} vs prev day</span>
                            },
                            { label: 'Total Events', value: totalEvents.toLocaleString(), unit: '', icon: <BarChart2 className="w-5 h-5" />, color: '#2E86DE', sub: `across ${data.length} days` },
                            { label: 'Total Anomalies', value: totalAnomalies, unit: '', icon: <AlertCircle className="w-5 h-5" />, color: '#F59E0B', sub: `${((totalAnomalies / totalEvents) * 100).toFixed(1)}% anomaly rate` },
                            { label: 'Critical Events', value: totalCritical, unit: '', icon: <AlertCircle className="w-5 h-5" />, color: '#EF4444', sub: `${((totalCritical / totalEvents) * 100).toFixed(1)}% critical rate` },
                        ].map(card => (
                            <div key={card.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-400 text-xs">{card.label}</p>
                                    <span style={{ color: card.color }}>{card.icon}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{card.value}<span className="text-gray-500 text-sm">{card.unit}</span></p>
                                <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Health Score Trend Chart */}
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
                        <p className="text-white font-semibold mb-4">Health Score Trend — Last {data.length} Days</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2E86DE" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2E86DE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="score" name="Health Score" stroke="#2E86DE" fill="url(#scoreGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Anomaly Volume Chart */}
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
                        <p className="text-white font-semibold mb-4">Daily Anomaly Volume</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="anomalies" name="Anomalies" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.critical > 0 ? '#EF4444' : '#F59E0B'} opacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Weekly Summary Table */}
                    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-800">
                            <p className="text-white font-semibold">Weekly Breakdown</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3">Week</th>
                                    <th className="text-right px-5 py-3">Avg Health</th>
                                    <th className="text-right px-5 py-3">Total Events</th>
                                    <th className="text-right px-5 py-3">Anomalies</th>
                                    <th className="text-right px-5 py-3">Critical</th>
                                    <th className="text-center px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weeks.map((week, i) => {
                                    const avg = Math.round(week.days.reduce((s, d) => s + d.health_score, 0) / week.days.length)
                                    const events = week.days.reduce((s, d) => s + d.total_events, 0)
                                    const anomalies = week.days.reduce((s, d) => s + d.anomaly_count, 0)
                                    const critical = week.days.reduce((s, d) => s + d.critical_count, 0)
                                    return (
                                        <tr key={i} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3 text-gray-300 text-xs">{week.label}</td>
                                            <td className="px-5 py-3 text-right font-bold" style={{ color: HEALTH_COLOR(avg) }}>{avg}</td>
                                            <td className="px-5 py-3 text-right text-gray-300">{events.toLocaleString()}</td>
                                            <td className="px-5 py-3 text-right text-yellow-400">{anomalies}</td>
                                            <td className="px-5 py-3 text-right text-red-400">{critical}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${avg >= 75 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : avg >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                    {avg >= 75 ? 'Healthy' : avg >= 50 ? 'At Risk' : 'Critical'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}