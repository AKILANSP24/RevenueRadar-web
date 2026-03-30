'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, Search, Download, RefreshCw, Filter } from 'lucide-react'

type Anomaly = {
    id: string
    event_id: string
    source: string
    amount: number
    timestamp: string
    severity: string
    z_score: number
    baseline_mean: number
    baseline_std: number
    ai_explanation: string | null
    created_at: string
}

const SEVERITY_COLORS: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    normal: 'bg-green-500/20 text-green-400 border border-green-500/30',
}

const ZSCORE_COLOR = (z: number) => {
    if (z >= 3) return 'text-red-400'
    if (z >= 2) return 'text-yellow-400'
    return 'text-green-400'
}

export default function AnomaliesPage() {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([])
    const [filtered, setFiltered] = useState<Anomaly[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [severityFilter, setSeverityFilter] = useState('all')
    const [sourceFilter, setSourceFilter] = useState('all')
    const [refreshing, setRefreshing] = useState(false)

    const fetchAnomalies = async () => {
        setRefreshing(true)
        const { data, error } = await supabase
            .from('anomaly_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(200)

        if (!error && data) {
            setAnomalies(data)
            setFiltered(data)
        }
        setLoading(false)
        setRefreshing(false)
    }

    useEffect(() => {
        fetchAnomalies()
    }, [])

    useEffect(() => {
        let result = [...anomalies]
        if (severityFilter !== 'all') result = result.filter(a => a.severity === severityFilter)
        if (sourceFilter !== 'all') result = result.filter(a => a.source === sourceFilter)
        if (search) result = result.filter(a =>
            a.event_id.toLowerCase().includes(search.toLowerCase()) ||
            a.source.toLowerCase().includes(search.toLowerCase()) ||
            (a.ai_explanation || '').toLowerCase().includes(search.toLowerCase())
        )
        setFiltered(result)
    }, [search, severityFilter, sourceFilter, anomalies])

    const exportCSV = () => {
        const header = 'Event ID,Source,Amount,Severity,Z-Score,Baseline Mean,Timestamp,AI Explanation'
        const rows = filtered.map(a =>
            `${a.event_id},${a.source},${a.amount},${a.severity},${a.z_score?.toFixed(2)},${a.baseline_mean?.toFixed(2)},${a.timestamp},"${(a.ai_explanation || '').replace(/"/g, "'")}"`
        )
        const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `anomalies_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const sources = ['all', ...Array.from(new Set(anomalies.map(a => a.source)))]

    const stats = {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        warning: anomalies.filter(a => a.severity === 'warning').length,
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-7 h-7 text-yellow-400" />
                    <h1 className="text-2xl font-bold text-white">Anomalies</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchAnomalies}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-gray-800 text-gray-400 hover:text-white hover:border-[#2E86DE] transition-all text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E86DE] text-white hover:bg-[#2E86DE]/80 transition-all text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Flagged', value: stats.total, color: 'text-white' },
                    { label: 'Critical', value: stats.critical, color: 'text-red-400' },
                    { label: 'Warning', value: stats.warning, color: 'text-yellow-400' },
                ].map(s => (
                    <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">{s.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center bg-[#111827] border border-gray-800 rounded-xl p-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search event ID, source, or AI explanation..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#0a0f1e] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2E86DE]"
                    />
                </div>
                <select
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value)}
                    className="px-3 py-2 bg-[#0a0f1e] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#2E86DE]"
                >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="normal">Normal</option>
                </select>
                <select
                    value={sourceFilter}
                    onChange={e => setSourceFilter(e.target.value)}
                    className="px-3 py-2 bg-[#0a0f1e] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#2E86DE]"
                >
                    {sources.map(s => (
                        <option key={s} value={s}>{s === 'all' ? 'All Sources' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
                <span className="text-gray-500 text-sm ml-auto">{filtered.length} results</span>
            </div>

            {/* Table */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">Loading anomalies...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
                        <AlertTriangle className="w-8 h-8 opacity-30" />
                        <p className="text-sm">No anomalies found. Start the Python pipeline to detect events.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">Event ID</th>
                                    <th className="text-left px-4 py-3">Source</th>
                                    <th className="text-right px-4 py-3">Amount</th>
                                    <th className="text-center px-4 py-3">Severity</th>
                                    <th className="text-right px-4 py-3">Z-Score</th>
                                    <th className="text-right px-4 py-3">Baseline Mean</th>
                                    <th className="text-left px-4 py-3">Timestamp</th>
                                    <th className="text-left px-4 py-3 max-w-xs">AI Explanation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((a, i) => (
                                    <tr
                                        key={a.id}
                                        className={`border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{a.event_id?.slice(0, 12)}...</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded bg-[#2E86DE]/10 text-[#2E86DE] border border-[#2E86DE]/20 text-xs font-medium capitalize">
                                                {a.source}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-white font-medium">${a.amount?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${SEVERITY_COLORS[a.severity] || ''}`}>
                                                {a.severity}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-mono font-bold ${ZSCORE_COLOR(a.z_score)}`}>
                                            {a.z_score?.toFixed(2)}σ
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-400">${a.baseline_mean?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                                            {new Date(a.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs max-w-xs">
                                            {a.ai_explanation
                                                ? <span className="line-clamp-2">{a.ai_explanation}</span>
                                                : <span className="text-gray-700 italic">No AI explanation</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}