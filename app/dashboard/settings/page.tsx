'use client'

import { useState } from 'react'
import { Settings, Bell, Database, Info, Save, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
    const [saved, setSaved] = useState(false)
    const [thresholds, setThresholds] = useState({
        criticalZScore: 3.0,
        warningZScore: 2.0,
        refreshInterval: 30,
        aiExplanations: true,
        emailAlerts: false,
    })

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    return (
        <div className="p-6 space-y-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Settings className="w-7 h-7 text-[#2E86DE]" />
                <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>

            {/* Detection Thresholds */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                    <Bell className="w-4 h-4 text-[#2E86DE]" />
                    <p className="text-white font-semibold">Detection Thresholds</p>
                </div>

                <div className="space-y-4">
                    {/* Critical Z-Score */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-sm text-gray-300">Critical Z-Score Threshold</label>
                            <span className="text-red-400 font-mono font-bold text-sm">{thresholds.criticalZScore.toFixed(1)}σ</span>
                        </div>
                        <input
                            type="range" min={2} max={5} step={0.1}
                            value={thresholds.criticalZScore}
                            onChange={e => setThresholds({ ...thresholds, criticalZScore: parseFloat(e.target.value) })}
                            className="w-full accent-red-500"
                        />
                        <p className="text-xs text-gray-600 mt-1">Transactions above this Z-score are flagged as Critical</p>
                    </div>

                    {/* Warning Z-Score */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-sm text-gray-300">Warning Z-Score Threshold</label>
                            <span className="text-yellow-400 font-mono font-bold text-sm">{thresholds.warningZScore.toFixed(1)}σ</span>
                        </div>
                        <input
                            type="range" min={1} max={3} step={0.1}
                            value={thresholds.warningZScore}
                            onChange={e => setThresholds({ ...thresholds, warningZScore: parseFloat(e.target.value) })}
                            className="w-full accent-yellow-500"
                        />
                        <p className="text-xs text-gray-600 mt-1">Transactions above this Z-score are flagged as Warning</p>
                    </div>

                    {/* Refresh Interval */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-sm text-gray-300">Dashboard Refresh Interval</label>
                            <span className="text-[#2E86DE] font-mono font-bold text-sm">{thresholds.refreshInterval}s</span>
                        </div>
                        <input
                            type="range" min={10} max={120} step={10}
                            value={thresholds.refreshInterval}
                            onChange={e => setThresholds({ ...thresholds, refreshInterval: parseInt(e.target.value) })}
                            className="w-full accent-blue-500"
                        />
                        <p className="text-xs text-gray-600 mt-1">How often the dashboard polls Supabase for new data</p>
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-gray-800">
                    {[
                        { key: 'aiExplanations', label: 'AI Explanations', sub: 'Enable Groq Llama-3 AI analysis for flagged anomalies', color: 'bg-[#10B981]' },
                        { key: 'emailAlerts', label: 'Email Alerts', sub: 'Send email notifications for critical anomalies (coming soon)', color: 'bg-[#2E86DE]' },
                    ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm text-gray-300">{item.label}</p>
                                <p className="text-xs text-gray-600">{item.sub}</p>
                            </div>
                            <button
                                onClick={() => setThresholds({ ...thresholds, [item.key]: !thresholds[item.key as keyof typeof thresholds] })}
                                className={`relative w-11 h-6 rounded-full transition-colors ${thresholds[item.key as keyof typeof thresholds] ? item.color : 'bg-gray-700'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${thresholds[item.key as keyof typeof thresholds] ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Info */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                    <Database className="w-4 h-4 text-[#2E86DE]" />
                    <p className="text-white font-semibold">System Information</p>
                </div>
                <div className="space-y-3 text-sm">
                    {[
                        { label: 'Frontend', value: 'Next.js 16 (App Router)' },
                        { label: 'Deployment', value: 'Vercel (Global Edge Network)' },
                        { label: 'Database', value: 'Supabase PostgreSQL — Singapore' },
                        { label: 'AI Model', value: 'Groq Llama-3 (llama3-8b-8192)' },
                        { label: 'Detection Method', value: 'Temporal Z-Score (24×7 Baseline Matrix)' },
                        { label: 'Pipeline', value: 'Python 3 — Stripe / PayPal / Shopify Simulators' },
                    ].map(row => (
                        <div key={row.label} className="flex justify-between">
                            <span className="text-gray-500">{row.label}</span>
                            <span className="text-gray-300 font-medium">{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* About */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
                    <Info className="w-4 h-4 text-[#2E86DE]" />
                    <p className="text-white font-semibold">About</p>
                </div>
                <div className="space-y-1 text-sm">
                    <p className="text-gray-300 font-semibold">RevenueRadar — Cloud Ecosystem Semester Project</p>
                    <p className="text-gray-500">SP Akilan · 22MIA1191 · VIT Chennai</p>
                    <p className="text-gray-600 mt-2 text-xs">CSE Business Analytics · Cloud Ecosystem Module · 2026</p>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2E86DE] text-white hover:bg-[#2E86DE]/80 transition-all font-medium"
            >
                {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
            <p className="text-xs text-gray-600 -mt-4">Note: Threshold changes take effect after restarting the Python pipeline.</p>
        </div>
    )
}