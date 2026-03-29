import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function proxy(req) {
    const res = NextResponse.next()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return res
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const authHeader = req.cookies.get('sb-access-token')?.value

        const isProtected = req.nextUrl.pathname.startsWith('/dashboard')
        const isAuthPage = req.nextUrl.pathname === '/auth'

        if (isProtected && !authHeader) {
            return NextResponse.redirect(new URL('/auth', req.url))
        }

        if (isAuthPage && authHeader) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    } catch (e) {
        console.error('Proxy error:', e)
    }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth']
}