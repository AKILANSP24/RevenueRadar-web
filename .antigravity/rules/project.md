# RevenueRadar Web — Cursor Project Context

## What This Is
Next.js 16 frontend for RevenueRadar — a real-time revenue anomaly
detection SaaS platform. This is the web frontend only.
The Python backend is in a separate folder called revenueradar/.

## Project Path
C:\Users\SP AKILAN\Music\revenueradar-web

## Tech Stack
- Next.js 16 with App Router
- TypeScript (.tsx files throughout)
- Tailwind CSS v4
- shadcn/ui components (in components/ui/)
- Supabase for auth and database
- lucide-react for icons
- tw-animate-css for animations

## Folder Structure
revenueradar-web/
├── app/
│   ├── layout.tsx          ← root layout
│   ├── globals.css         ← all styles + animation classes
│   ├── page.tsx            ← landing page (imports from components/)
│   ├── auth/
│   │   └── page.tsx        ← login/signup page
│   └── dashboard/
│       ├── layout.tsx      ← sidebar + auth protection
│       └── page.tsx        ← main dashboard with Supabase data
├── components/
│   ├── auth/
│   │   ├── auth-card.tsx       ← login/signup form with Supabase auth
│   │   ├── animated-background.tsx ← floating orb animations
│   │   └── lightning-bolt.tsx  ← logo icon
│   ├── ui/                 ← shadcn/ui components (DO NOT EDIT)
│   ├── navbar.tsx          ← landing page navbar
│   ├── hero.tsx            ← hero section with animated blobs
│   ├── features.tsx        ← 3 feature cards
│   ├── how-it-works.tsx    ← 3 step process
│   ├── stats.tsx           ← stats bar
│   ├── pricing.tsx         ← pricing card
│   └── footer.tsx          ← footer
├── lib/
│   └── supabase.js         ← Supabase client singleton
├── hooks/
│   └── use-mobile.ts       ← mobile detection hook
└── .env.local              ← Supabase keys (never commit)

## Environment Variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

## Supabase Tables (in Supabase project)
anomaly_events: id, event_id, source, amount, timestamp,
  severity, z_score, baseline_mean, baseline_std,
  ai_explanation, created_at

daily_health_scores: id, date, health_score, total_events,
  anomaly_count, critical_count, created_at

raw_events: id, event_id, source, event_type, amount,
  currency, timestamp, customer_id, plan_tier, region,
  metadata, created_at

## Color Scheme (STRICT — never deviate)
Primary Blue:  #2E86DE
Accent Green:  #10B981
Dark Base:     #0a0f1e
Card BG:       rgba(255,255,255,0.045) glassmorphism
Border:        rgba(255,255,255,0.1)

## Animation Classes (defined in globals.css)
.animate-blob          ← hero background blobs
.animate-float-orb     ← auth page orbs
.animate-float-orb-2   ← auth page orbs delayed
.animate-bolt          ← lightning bolt icon pulse
.animation-delay-2000  ← 2s delay
.animation-delay-4000  ← 4s delay
.glass-card            ← glassmorphism card style
.input-glow            ← input focus glow effect

## Auth Flow
1. User visits /auth → sees auth-card.tsx (login/signup tabs)
2. On login → supabase.auth.signInWithPassword()
3. On success → redirect to /dashboard
4. Dashboard layout checks session → redirects to /auth if none
5. Logout → supabase.auth.signOut() → redirect to /

## Dashboard Data (fetched from Supabase)
- daily_health_scores → health score metric cards
- anomaly_events → live feed table, charts, heatmap
- Auto-refreshes every 30 seconds using setInterval

## Strict Coding Rules
- All new files must be .tsx (TypeScript)
- All secrets via .env.local only — never hardcode
- shadcn components in components/ui/ — never modify directly
- lib/supabase.js is the single Supabase client — never use createClient() directly in components
- Dashboard layout uses onAuthStateChange for session detection
- Auth card imports supabase from @/lib/supabase
- No inline styles where Tailwind class exists
- Every new component needs 'use client' if it uses hooks
- Color values must match the Color Scheme above exactly

## Current Status (as of last session)
- Landing page: DONE (navbar, hero, features, stats, pricing, footer)
- Auth page: DONE (glassmorphism card, animated background, tabs)
- Dashboard: DONE (sidebar layout, metric cards, anomaly feed table)
- Supabase auth: CONNECTED (login/signup working)
- Animations: DONE (globals.css has all keyframes)
- Deployment: PENDING (not yet on Vercel)

## Next Steps When Resuming
1. Test login flow end to end
2. Verify dashboard loads real data from Supabase
3. Add recharts line chart to dashboard for MRR trend
4. Deploy to Vercel
5. Set environment variables in Vercel dashboard