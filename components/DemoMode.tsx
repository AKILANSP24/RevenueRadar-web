'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type DemoState = 'idle' | 'injecting' | 'success' | 'error'

const DEMO_SCENARIOS = [
    {
        source: 'paypal',
        amount: 287432.90,
        z_score: 5.43,
        baseline_mean: 19200.00,
        baseline_std: 13100.00,
        ai_explanation: 'PayPal recorded its highest single transaction in the 30-day baseline window — a 5.4 sigma event. This exceeds the 99.9th percentile of historical volume. Immediate account suspension and chargeback prevention protocol recommended.',
    },
    {
        source: 'stripe',
        amount: 169348.76,
        z_score: 4.21,
        baseline_mean: 22000.00,
        baseline_std: 15200.00,
        ai_explanation: 'Stripe recorded a cross-border enterprise-scale transaction far outside normal peak patterns — a 4.2 sigma BURST event. Escalate to fraud team and verify merchant identity via secondary channel before releasing funds.',
    },
    {
        source: 'shopify',
        amount: 312876.54,
        z_score: 6.02,
        baseline_mean: 8500.00,
        baseline_std: 5100.00,
        ai_explanation: 'Shopify bulk order anomaly is 6.0 standard deviations above baseline — the highest sigma event recorded this session. Statistically consistent with coordinated account takeover. Block transaction and notify merchant via out-of-band contact immediately.',
    },
]

let scenarioIndex = 0

export function useDemoMode() {
    const [demoState, setDemoState] = useState<DemoState>('idle')
    const [demoVisible, setDemoVisible] = useState(false)
    const [injectedSource, setInjectedSource] = useState('')

    const injectAnomaly = useCallback(async () => {
        if (demoState === 'injecting') return

        setDemoState('injecting')
        setDemoVisible(true)

        const scenario = DEMO_SCENARIOS[scenarioIndex % DEMO_SCENARIOS.length]
        scenarioIndex++

        try {
            const eventId = crypto.randomUUID()

            const { error } = await supabase
                .from('anomaly_events')
                .insert({
                    event_id: eventId,
                    source: scenario.source,
                    amount: scenario.amount,
                    timestamp: new Date().toISOString(),
                    severity: 'critical',
                    z_score: scenario.z_score,
                    baseline_mean: scenario.baseline_mean,
                    baseline_std: scenario.baseline_std,
                    ai_explanation: scenario.ai_explanation,
                })

            if (error) throw error

            setInjectedSource(scenario.source)
            setDemoState('success')

            // Also update health score for today to reflect the new critical event
            const today = new Date().toISOString().split('T')[0]
            const { data: existing } = await supabase
                .from('daily_health_scores')
                .select('*')
                .eq('date', today)
                .single()

            if (existing) {
                const newCritical = (existing.critical_count || 0) + 1
                const newAnomaly = (existing.anomaly_count || 0) + 1
                const newScore = Math.max(0, existing.health_score - 10)
                await supabase
                    .from('daily_health_scores')
                    .update({
                        critical_count: newCritical,
                        anomaly_count: newAnomaly,
                        health_score: newScore,
                    })
                    .eq('date', today)
            }

            // Auto-hide overlay after 4 seconds
            setTimeout(() => {
                setDemoState('idle')
                setDemoVisible(false)
            }, 4000)

        } catch (err) {
            console.error('Demo injection failed:', err)
            setDemoState('error')
            setTimeout(() => {
                setDemoState('idle')
                setDemoVisible(false)
            }, 3000)
        }
    }, [demoState])

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault()
                injectAnomaly()
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [injectAnomaly])

    return { demoState, demoVisible, injectedSource, injectAnomaly }
}


// ── Visual overlay shown when demo is triggered ──────────────────────────────

export function DemoModeOverlay() {
    const { demoState, demoVisible, injectedSource, injectAnomaly } = useDemoMode()

    if (!demoVisible) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
            {/* Dim background */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Center card */}
            <div
                className="relative rounded-2xl border border-red-500/40 bg-[#0a0f1e] px-10 py-8 text-center shadow-2xl max-w-sm w-full mx-4"
                style={{
                    boxShadow: '0 0 60px rgba(239,68,68,0.2)',
                    animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                }}
            >
                {demoState === 'injecting' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-full border-2 border-red-500/50 border-t-red-500 animate-spin" />
                        </div>
                        <p className="text-white font-bold text-lg mb-1">Injecting Critical Anomaly</p>
                        <p className="text-gray-400 text-sm">Writing to Supabase...</p>
                    </>
                )}

                {demoState === 'success' && (
                    <>
                        {/* Red pulse rings */}
                        <div className="relative flex justify-center mb-4">
                            <div className="absolute h-16 w-16 rounded-full bg-red-500/10 animate-ping" />
                            <div className="relative h-12 w-12 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                                <span className="text-2xl">⚡</span>
                            </div>
                        </div>

                        <p className="text-red-400 font-bold text-lg mb-1 uppercase tracking-wide">
                            Critical Alert Fired
                        </p>
                        <p className="text-gray-300 text-sm mb-3">
                            <span className="capitalize font-semibold text-white">{injectedSource}</span> anomaly injected into Supabase
                        </p>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Alert banner will appear within 5 seconds
                        </div>

                        <div className="mt-4 text-[10px] text-gray-600 font-mono">
                            Ctrl+Shift+D — Demo Mode
                        </div>
                    </>
                )}

                {demoState === 'error' && (
                    <>
                        <p className="text-yellow-400 font-bold text-lg mb-1">Injection Failed</p>
                        <p className="text-gray-400 text-sm">Check Supabase connection</p>
                    </>
                )}
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
        </div>
    )
}