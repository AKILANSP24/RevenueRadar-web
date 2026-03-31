'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react'
import { TimeRangeSelector, TimeRange, getTimeRangeStart } from '@/components/TimeRangeSelector'
import { AnomalyDetailModal } from '@/components/AnomalyDetailModal'

type Incident = {
    id: string
    event_id: string
    source: string
    amount: number
    timestamp: string
    severity: 'critical' | 'warning' | 'normal'
    z_score: number
    baseline_mean: number
    baseline_std: number
    ai_explanation: string | null
    // derived
    status: 'open' | 'investigating' | 'resolved'
    duration: string
}

const STATUS_CFG = {
    open: { label: 'Open', color: '#EF4444', bg: 'bg-red-500/10 border-red-500/30' },
    investigating: { label: 'Investigating', color: '#F59E0B', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    resolved: { label: 'Resolved', color: '#10B981', bg: 'bg-green-500/10 border-green-500/30' },
}

function deriveStatus(event: { severity: string; timestamp: string }): Incident['status'] {
    const ageMin = (Date.now() - new Date(event.timestamp).getTime()) / 60000
    if (event.severity === 'critical' && ageMin < 15) return 'open'
    if (event.severity === 'critical' && ageMin < 120) return 'investigating'
    return 'resolved'
}

function formatDuration(ts: string): string {
    const diffMin = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const h = Math.floor(diffMin / 60)
    const m = diffMin % 60
    return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [range, setRange] = useState<TimeRange>('24h')
    const [statusFilter, setStatusFilter] = useState<'all' | Incident['status']>('all')
    const [sourceFilter, setSourceFilter] = useState('all')
    const [selected, setSelected] = useState<Incident | null>(null)

    const fetchIncidents = async () => {
        setRefreshing(true)
        const since = getTimeRangeStart(range)
        const { data, error } = await supabase
            .from('anomaly_events')
            .select('*')
            .gte('timestamp', since)
            .in('severity', ['critical', 'warning'])
            .order('timestamp', { ascending: false })
            .limit(200)

        if (!error && data) {
            const enriched: Incident[] = data.map(e => ({
                ...e,
                status: deriveStatus(e),
                duration: formatDuration(e.timestamp),
            }))
            setIncidents(enriched)
        }
        setLoading(false)
        setRefreshing(false)
    }

    useEffect(() => { fetchIncidents() }, [range])

    const filtered = incidents.filter(i => {
        if (statusFilter !== 'all' && i.status !== statusFilter) return false
        if (sourceFilter !== 'all' && i.source !== sourceFilter) return false
        return true
    })

    const counts = {
        open: incidents.filter(i => i.status === 'open').length,
        investigating: incidents.filter(i => i.status === 'investigating').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        critical: incidents.filter(i => i.severity === 'critical').length,
    }

    const sources = ['all', ...Array.from(new Set(incidents.map(i => i.source)))]

    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-7 h-7 text-red-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Incident Log</h1>
                        <p className="text-gray-500 text-sm">Every threshold breach — open, investigating, resolved</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <TimeRangeSelector value={range} onChange={r => { setRange(r); }} />
                    <button onClick={fetchIncidents} disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-gray-800 text-gray-400 hover:text-white text-sm transition-all">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Status summary */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Open', value: counts.open, icon: XCircle, color: '#EF4444' },
                    { label: 'Investigating', value: counts.investigating, icon: AlertTriangle, color: '#F59E0B' },
                    { label: 'Resolved', value: counts.resolved, icon: CheckCircle, color: '#10B981' },
                    { label: 'Critical', value: counts.critical, icon: Shield, color: '#EF4444' },
                ].map(s => (
                    <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                            <s.icon className="h-5 w-5" style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">{s.label}</p>
                            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center bg-[#111827] border border-gray-800 rounded-xl p-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <div className="flex gap-1">
                    {(['all', 'open', 'investigating', 'resolved'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s
                                ? 'bg-[#2E86DE] text-white'
                                : 'text-gray-500 hover:text-white hover:bg-gray-800'
                                }`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="h-4 w-px bg-gray-700" />
                <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                    className="px-3 py-1.5 bg-[#0a0f1e] border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#2E86DE]">
                    {sources.map(s => (
                        <option key={s} value={s}>{s === 'all' ? 'All Sources' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
                <span className="ml-auto text-gray-500 text-xs">{filtered.length} incidents</span>
            </div>

            {/* Incident table */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">Loading incidents...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500">
                        <CheckCircle className="w-8 h-8 opacity-30" />
                        <p className="text-sm">No incidents in this time range.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-left px-4 py-3">Time</th>
                                    <th className="text-left px-4 py-3">Source</th>
                                    <th className="text-right px-4 py-3">Amount</th>
                                    <th className="text-center px-4 py-3">Severity</th>
                                    <th className="text-right px-4 py-3">Z-Score</th>
                                    <th className="text-left px-4 py-3">AI Summary</th>
                                    <th className="text-center px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((inc, i) => {
                                    const scfg = STATUS_CFG[inc.status]
                                    return (
                                        <tr key={inc.id}
                                            className={`border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                                            onClick={() => setSelected(inc)}>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${scfg.bg}`}
                                                    style={{ color: scfg.color }}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: scfg.color }} />
                                                    {scfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-300 text-xs">{new Date(inc.timestamp).toLocaleString()}</p>
                                                <p className="text-gray-600 text-[10px] flex items-center gap-1 mt-0.5">
                                                    <Clock className="h-2.5 w-2.5" /> {inc.duration}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded bg-[#2E86DE]/10 text-[#2E86DE] border border-[#2E86DE]/20 text-xs font-medium capitalize">
                                                    {inc.source}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-white font-medium text-xs">
                                                ₹{Number(inc.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${inc.severity === 'critical'
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                    }`}>
                                                    {inc.severity}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${inc.z_score >= 4 ? 'text-red-400' : inc.z_score >= 2 ? 'text-yellow-400' : 'text-green-400'
                                                }`}>
                                                {inc.z_score.toFixed(2)}σ
                                            </td>
                                            <td className="px-4 py-3 max-w-xs">
                                                {inc.ai_explanation
                                                    ? <span className="text-gray-400 text-xs line-clamp-1">{inc.ai_explanation}</span>
                                                    : <span className="text-gray-700 text-xs italic">No AI explanation</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={e => { e.stopPropagation(); setSelected(inc) }}
                                                    className="text-[10px] px-2 py-1 rounded bg-[#2E86DE]/10 text-[#2E86DE] border border-[#2E86DE]/20 hover:bg-[#2E86DE]/20 transition-all">
                                                    Investigate
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            <AnomalyDetailModal event={selected} onClose={() => setSelected(null)} />
        </div>
    )
}