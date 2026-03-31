'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, X, Zap } from 'lucide-react'

interface CriticalAlert {
    id: string
    source: string
    amount: number
    z_score: number
    ai_explanation: string | null
    timestamp: string
}

export function CriticalAlertBanner() {
    const [alert, setAlert] = useState<CriticalAlert | null>(null)
    const [visible, setVisible] = useState(false)
    const [lastSeenId, setLastSeenId] = useState<string | null>(null)

    useEffect(() => {
        // Poll for new critical events every 5 seconds
        const check = async () => {
            const { data } = await supabase
                .from('anomaly_events')
                .select('id, source, amount, z_score, ai_explanation, timestamp')
                .eq('severity', 'critical')
                .order('created_at', { ascending: false })
                .limit(1)

            if (data && data.length > 0 && data[0].id !== lastSeenId) {
                setLastSeenId(data[0].id)
                setAlert(data[0])
                setVisible(true)

                // Auto-dismiss after 30 seconds
                setTimeout(() => setVisible(false), 30000)
            }
        }

        check()
        const interval = setInterval(check, 5000)
        return () => clearInterval(interval)
    }, [lastSeenId])

    if (!visible || !alert) return null

    return (
        <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            style={{ animation: 'slideDown 0.3s ease-out' }}
        >
            <div className="relative rounded-xl border border-red-500/50 bg-[#0a0f1e] shadow-2xl overflow-hidden">
                {/* Animated red glow border */}
                <div className="absolute inset-0 rounded-xl border-2 border-red-500/30"
                    style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />

                {/* Red sweep background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 via-red-800/10 to-transparent" />

                <div className="relative flex items-start gap-4 px-5 py-4">
                    {/* Pulsing icon */}
                    <div className="shrink-0 mt-0.5">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                            <div className="relative h-9 w-9 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-red-400" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-red-400 font-bold text-sm tracking-wide uppercase">
                                Critical Anomaly Detected
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                                Z: {Number(alert.z_score).toFixed(2)}σ
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-white font-semibold capitalize">{alert.source}</span>
                            <span className="text-gray-400 text-sm">
                                ₹{Number(alert.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-gray-600 text-xs">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                        </div>

                        {alert.ai_explanation && (
                            <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                                {alert.ai_explanation}
                            </p>
                        )}
                    </div>

                    {/* Dismiss */}
                    <button
                        onClick={() => setVisible(false)}
                        className="shrink-0 text-gray-500 hover:text-white transition-colors mt-0.5"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Auto-dismiss progress bar */}
                <div className="h-0.5 bg-red-900/30">
                    <div
                        className="h-full bg-red-500/60"
                        style={{ animation: 'shrink 30s linear forwards' }}
                    />
                </div>
            </div>

            <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
        </div>
    )
}