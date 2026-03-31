'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react'

type SystemStatus = 'healthy' | 'degraded' | 'critical'

export function ExecutiveStatusBar() {
    const [status, setStatus] = useState<SystemStatus>('healthy')
    const [healthScore, setHealthScore] = useState<number | null>(null)
    const [criticalToday, setCriticalToday] = useState(0)
    const [totalToday, setTotalToday] = useState(0)
    const [lastUpdate, setLastUpdate] = useState<string>('')
    const [dbOk, setDbOk] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const today = new Date().toISOString().split('T')[0]

                const [healthRes, critRes, eventsRes] = await Promise.all([
                    supabase.from('daily_health_scores').select('health_score').eq('date', today).single(),
                    supabase.from('anomaly_events').select('id', { count: 'exact' }).eq('severity', 'critical')
                        .gte('timestamp', new Date(Date.now() - 86400000).toISOString()),
                    supabase.from('raw_events').select('id', { count: 'exact' })
                        .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
                ])

                const score = healthRes.data?.health_score ?? null
                const crit = critRes.count ?? 0
                const total = eventsRes.count ?? 0

                setHealthScore(score)
                setCriticalToday(crit)
                setTotalToday(total)
                setDbOk(true)
                setLastUpdate(new Date().toLocaleTimeString())

                if (score !== null) {
                    if (score >= 80) setStatus('healthy')
                    else if (score >= 60) setStatus('degraded')
                    else setStatus('critical')
                }
            } catch {
                setDbOk(false)
                setStatus('degraded')
            }
        }

        fetch()
        const interval = setInterval(fetch, 15000)
        return () => clearInterval(interval)
    }, [])

    const STATUS_CONFIG = {
        healthy: { icon: CheckCircle, color: '#10B981', bg: 'bg-green-500/5  border-green-500/20', label: 'All Systems Operational' },
        degraded: { icon: AlertTriangle, color: '#F59E0B', bg: 'bg-yellow-500/5 border-yellow-500/20', label: 'Anomalies Detected' },
        critical: { icon: XCircle, color: '#EF4444', bg: 'bg-red-500/5    border-red-500/20', label: 'Critical Threat Active' },
    }

    const cfg = STATUS_CONFIG[status]
    const Icon = cfg.icon

    return (
        <div className={`flex items-center justify-between px-5 py-2.5 rounded-xl border mb-5 ${cfg.bg}`}>
            {/* Left — status */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    {status !== 'healthy' && (
                        <div className="absolute inset-0 rounded-full animate-ping opacity-40"
                            style={{ backgroundColor: cfg.color }} />
                    )}
                    <Icon className="h-4 w-4 relative" style={{ color: cfg.color }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                <div className="h-3 w-px bg-gray-700" />
                <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${dbOk ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-500">Supabase {dbOk ? 'Connected' : 'Error'}</span>
                </div>
            </div>

            {/* Center — quick stats */}
            <div className="hidden md:flex items-center gap-6">
                {[
                    { label: 'Health Score', value: healthScore !== null ? `${healthScore.toFixed(1)}/100` : '—', color: healthScore !== null ? (healthScore >= 80 ? '#10B981' : healthScore >= 60 ? '#F59E0B' : '#EF4444') : '#6B7280' },
                    { label: 'Critical Today', value: criticalToday.toString(), color: criticalToday > 0 ? '#EF4444' : '#10B981' },
                    { label: 'Events (24h)', value: totalToday.toLocaleString(), color: '#2E86DE' },
                ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{s.label}</span>
                        <span className="text-xs font-bold font-mono" style={{ color: s.color }}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Right — last updated */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Activity className="h-3 w-3" />
                <span>Updated {lastUpdate}</span>
            </div>
        </div>
    )
}