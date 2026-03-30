'use client'
import { supabase } from '../../../lib/supabase'

export default function SettingsPage() {
    return (
        <div className="max-w-7xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-2xl">⚙️</span> Settings
            </h1>
            <div className="mt-8 overflow-hidden rounded-xl border border-gray-800 bg-[#111827] p-16 text-center shadow-lg">
                <div className="text-gray-400 text-xl font-medium">Coming Soon</div>
                <p className="mt-2 text-gray-500 text-sm">Platform configuration, alerting rules, and user management will be available here.</p>
            </div>
        </div>
    )
}
