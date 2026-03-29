'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function AuthPage() {
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({
                email, password
            })
            if (error) {
                setMessage(error.message)
            } else {
                router.push('/dashboard')
            }
        } else {
            const { error } = await supabase.auth.signUp({
                email, password
            })
            if (error) {
                setMessage(error.message)
            } else {
                setMessage('Account created! You can now log in.')
                setMode('login')
            }
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: '#0a0f1e' }}>
            <div className="w-full max-w-md p-8 rounded-2xl border border-gray-800"
                style={{ background: '#111827' }}>

                <div className="text-center mb-8">
                    <span className="text-4xl">⚡</span>
                    <h1 className="text-2xl font-bold text-white mt-2">RevenueRadar</h1>
                    <p className="text-gray-400 text-sm mt-1">Revenue Intelligence Platform</p>
                </div>

                <div className="flex rounded-lg overflow-hidden mb-6 border border-gray-700">
                    <button
                        onClick={() => setMode('login')}
                        className="flex-1 py-2 text-sm font-medium transition-colors"
                        style={{
                            background: mode === 'login' ? '#2E86DE' : 'transparent',
                            color: 'white'
                        }}>
                        Login
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className="flex-1 py-2 text-sm font-medium transition-colors"
                        style={{
                            background: mode === 'signup' ? '#2E86DE' : 'transparent',
                            color: 'white'
                        }}>
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg text-white border border-gray-700 outline-none focus:border-blue-500"
                            style={{ background: '#1f2937' }}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg text-white border border-gray-700 outline-none focus:border-blue-500"
                            style={{ background: '#1f2937' }}
                        />
                    </div>

                    {message && (
                        <p className="text-sm text-center"
                            style={{ color: message.includes('created') ? '#2ecc71' : '#e74c3c' }}>
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="py-3 rounded-lg text-white font-semibold mt-2"
                        style={{ background: '#2E86DE', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
                        ← Back to home
                    </Link>
                </div>

            </div>
        </div>
    )
}