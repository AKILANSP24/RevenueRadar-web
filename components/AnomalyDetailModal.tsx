'use client'

import { X, Brain, TrendingUp, AlertTriangle, Clock, DollarSign, Activity } from 'lucide-react'

interface AnomalyEvent {
    id: string
    event_id?: string
    timestamp: string
    source: string
    amount: number
    severity: 'critical' | 'warning' | 'normal'
    z_score: number
    baseline_mean: number
    baseline_std: number
    ai_explanation: string | null
}

const SEVERITY_CONFIG = {
    critical: { color: '#EF4444', bg: 'bg-red-500/10 border-red-500/30', label: 'CRITICAL' },
    warning: { color: '#F59E0B', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'WARNING' },
    normal: { color: '#10B981', bg: 'bg-green-500/10 border-green-500/30', label: 'NORMAL' },
}

export function AnomalyDetailModal({
    event,
    onClose,
}: {
    event: AnomalyEvent | null
    onClose: () => void
}) {
    if (!event) return null

    const cfg = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.normal
    const deviation = event.baseline_mean > 0
        ? ((event.amount - event.baseline_mean) / event.baseline_mean * 100).toFixed(1)
        : '0'
    const upperBound = (event.baseline_mean + 2 * event.baseline_std).toFixed(0)
    const lowerBound = Math.max(0, event.baseline_mean - 2 * event.baseline_std).toFixed(0)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#0d1424] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
                style={{ animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>

                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-800 ${cfg.bg}`}>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5" style={{ color: cfg.color }} />
                        <div>
                            <span className="text-white font-bold capitalize">{event.source}</span>
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full border font-bold"
                                style={{ color: cfg.color, borderColor: cfg.color + '40', backgroundColor: cfg.color + '15' }}>
                                {cfg.label}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">

                    {/* Key metrics row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: DollarSign, label: 'Transaction Amount', value: `₹${Number(event.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: cfg.color },
                            { icon: TrendingUp, label: 'Z-Score', value: `${Number(event.z_score).toFixed(3)}σ`, color: event.z_score >= 4 ? '#EF4444' : event.z_score >= 2 ? '#F59E0B' : '#10B981' },
                            { icon: Activity, label: 'Deviation from Baseline', value: `+${deviation}%`, color: cfg.color },
                        ].map(m => (
                            <div key={m.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4 text-center">
                                <m.icon className="h-4 w-4 mx-auto mb-2" style={{ color: m.color }} />
                                <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                                <p className="font-bold font-mono text-sm" style={{ color: m.color }}>{m.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Baseline comparison */}
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Baseline Comparison</p>
                        <div className="space-y-2">
                            {/* Visual bar */}
                            <div className="relative h-6 bg-gray-900 rounded-full overflow-hidden">
                                {/* Normal range */}
                                <div className="absolute h-full bg-green-500/20 rounded-full"
                                    style={{ width: '60%', left: '20%' }} />
                                {/* Actual value indicator */}
                                <div className="absolute h-full w-1 rounded-full"
                                    style={{
                                        backgroundColor: cfg.color,
                                        left: `${Math.min(95, Math.max(5, 50 + (event.z_score / 8) * 45))}%`,
                                    }} />
                                {/* Labels */}
                                <div className="absolute inset-0 flex items-center justify-between px-3">
                                    <span className="text-[9px] text-gray-600">Low</span>
                                    <span className="text-[9px] text-green-500">Normal range</span>
                                    <span className="text-[9px] text-gray-600">High</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-[10px] text-gray-500">Lower bound (2σ)</p>
                                    <p className="text-xs font-mono text-gray-300">₹{Number(lowerBound).toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500">Baseline mean</p>
                                    <p className="text-xs font-mono text-white font-bold">₹{Number(event.baseline_mean).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500">Upper bound (2σ)</p>
                                    <p className="text-xs font-mono text-gray-300">₹{Number(upperBound).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-4 w-4 text-[#2E86DE]" />
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Groq AI Analysis</p>
                            <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-[#2E86DE]/10 text-[#2E86DE] border border-[#2E86DE]/20">
                                llama-3.3-70b
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {event.ai_explanation || 'No AI explanation available for this event.'}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Detected: {new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Activity className="h-3.5 w-3.5" />
                            <span>Std dev: ₹{Number(event.baseline_std).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes modalIn {
          from { transform: scale(0.92) translateY(8px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    )
}