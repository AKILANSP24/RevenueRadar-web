'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ email?: string } | null>(null)
    const [checking, setChecking] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let isMounted = true

        async function init() {
            // First attempt
            const { data: { session } } = await supabase.auth.getSession()

            if (session && isMounted) {
                setUser(session.user)
                setChecking(false)
                return
            }

            // Wait 1 second and retry — handles race condition after redirect
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (!isMounted) return

            const { data: { session: session2 } } = await supabase.auth.getSession()
            if (!isMounted) return

            if (session2) {
                setUser(session2.user)
                setChecking(false)
            } else {
                setChecking(false)
                router.push('/auth')
            }
        }

        init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!isMounted) return
                console.log('AUTH EVENT:', event, !!session)
                if (event === 'SIGNED_OUT') {
                    setUser(null)
                    router.push('/auth')
                } else if (session) {
                    setUser(session.user)
                    setChecking(false)
                }
            }
        )

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [router])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
                <div className="text-gray-400 text-sm">Loading...</div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen flex" style={{ background: '#0a0f1e' }}>
            <aside className="w-56 border-r border-gray-800 flex flex-col p-4" style={{ background: '#070b14' }}>
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
                        <Link key={item.label} href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm">
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto">
                    <div className="px-3 py-2 text-xs text-gray-600 truncate">{user?.email}</div>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                        className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        🚪 Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
    )
}