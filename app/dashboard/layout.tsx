'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ email?: string } | null>(null)
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/auth')
            } else {
                setUser(session.user)
            }
        })
    }, [router])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#0a0f1e' }}>

            {/* Sidebar */}
            <aside
                className="w-56 border-r border-gray-800 flex flex-col p-4"
                style={{ background: '#070b14' }}
            >
                <div className="flex items-center gap-2 mb-8 px-2">
                    <span className="text-xl">⚡</span>
                    <span className="font-bold text-white">RevenueRadar</span>
                </div>
                <nav className="flex flex-col gap-1">
                    {[
                        { label: 'Dashboard', href: '/dashboard', icon: '📊' },
                        { label: 'Anomalies', href: '/dashboard', icon: '🚨' },
                        { label: 'Reports', href: '/dashboard', icon: '📈' },
                        { label: 'Settings', href: '/dashboard', icon: '⚙️' },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto">
                    <div className="px-3 py-2 text-xs text-gray-600 truncate">
                        {user?.email}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition-colors"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-6">
                {children}
            </main>

        </div>
    )
}