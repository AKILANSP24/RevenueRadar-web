# RevenueRadar Web — Cursor Project Context

## What This Is
Next.js 16 frontend for RevenueRadar — a real-time revenue anomaly
detection SaaS platform. This is the web frontend only.
The Python backend is in a separate folder: C:\Users\SP AKILAN\Music\revenueradar\

## Live URLs
- Production: https://revenue-radar-web.vercel.app
- Local dev:  http://localhost:3000

## Project Path
C:\Users\SP AKILAN\Music\revenueradar-web

## GitHub Repos
- Frontend: https://github.com/AKILANSP24/RevenueRadar-web
- Backend:  https://github.com/AKILANSP24/revenueradar

## Tech Stack
- Next.js 16 with App Router
- TypeScript (.tsx files throughout)
- Tailwind CSS v4
- shadcn/ui components (in components/ui/)
- Supabase for auth and database
- lucide-react for icons
- recharts for dynamic data visualizations
- tw-animate-css for animations

## Folder Structure
revenueradar-web/
├── app/
│   ├── layout.tsx              ← root layout (Geist font, dark class)
│   ├── globals.css             ← all styles + animation classes
│   ├── page.tsx                ← landing page (v0 animated components)
│   ├── auth/
│   │   └── page.tsx            ← glassmorphism login/signup page
│   └── dashboard/
│       ├── layout.tsx          ← sidebar + Supabase auth protection
│       ├── page.tsx            ← main dashboard with all charts
│       ├── anomalies/
│       │   └── page.tsx        ← anomalies page (UI ready, data pending)
│       ├── reports/
│       │   └── page.tsx        ← reports page (UI ready, data pending)
│       └── settings/
│           └── page.tsx        ← settings page (UI ready, data pending)
├── components/
│   ├── auth/
│   │   ├── auth-card.tsx       ← login/signup form — imports from @/lib/supabase
│   │   ├── animated-background.tsx
│   │   └── lightning-bolt.tsx
│   ├── ui/                     ← shadcn/ui — NEVER EDIT DIRECTLY
│   ├── navbar.tsx              ← landing navbar with /auth link
│   ├── hero.tsx                ← animated hero with /auth + /dashboard links
│   ├── features.tsx
│   ├── how-it-works.tsx
│   ├── stats.tsx
│   ├── pricing.tsx             ← CTA links to /auth
│   └── footer.tsx
├── lib/
│   └── supabase.js             ← SINGLE Supabase client — always import from here
├── hooks/
│   └── use-mobile.ts
├── .env.local                  ← never commit — Supabase keys
├── .vercelignore               ← excludes Auth Page/, Landing Page/, Generate Dashboard/
└── README.md                   ← academic README for faculty evaluation

## Environment Variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://owdshunajxgyxiyzvsuf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

## Supabase Project
Project ID: owdshunajxgyxiyzvsuf
Region: Singapore

### Tables
anomaly_events:
  id, event_id, source, amount, timestamp,
  severity, z_score, baseline_mean, baseline_std,
  ai_explanation, created_at

daily_health_scores:
  id, date, health_score, total_events,
  anomaly_count, critical_count, created_at

raw_events:
  id, event_id, source, event_type, amount,
  currency, timestamp, customer_id, plan_tier,
  region, metadata, created_at

### Row Level Security
RLS enabled on all 3 tables:
- SELECT: authenticated role (web dashboard users)
- INSERT: service_role only (Python pipeline)

## Color Scheme — NEVER DEVIATE
Primary Blue:  #2E86DE
Accent Green:  #10B981
Dark Base:     #0a0f1e
Card BG:       #111827
Border:        border-gray-800

## Animation Classes (globals.css)
.animate-blob           ← hero background blobs
.animate-float-orb      ← auth page orbs
.animate-float-orb-2    ← auth page orbs delayed
.animate-bolt           ← lightning bolt pulse
.animation-delay-2000   ← 2s delay
.animation-delay-4000   ← 4s delay
.glass-card             ← glassmorphism card
.input-glow             ← input focus glow

## Dashboard — app/dashboard/page.tsx
### Data Sources
- daily_health_scores → health gauge, trend chart, metric cards
- anomaly_events → live feed table, severity donut, source risk chart
- anomaly_events (filtered) → AI Intelligence Summary (critical/warning with ai_explanation)
- Auto-refreshes every 30 seconds

### Components
1. Health Score Gauge — RadialBarChart, color-coded 0-100
2. Metric Cards — Analyzed Events, Flagged Anomalies, Critical Alerts
3. Health Score Trend — 14-day AreaChart from daily_health_scores
4. Anomaly Severity Ratio — PieChart donut from events state
5. Source Risk Chart — Horizontal BarChart grouped by source
6. Detection Methodology — Static info card (Temporal Z-Score, AI, Correlation)
7. AI Intelligence Summary — Last 5 critical/warning events with ai_explanation
8. Live Anomaly Feed — Table with CSV export, Z-score colors, hover tooltips

## Auth Flow
1. User visits /auth → AnimatedBackground + AuthCard
2. AuthCard imports supabase from @/lib/supabase (NOT createClient directly)
3. On login → router.replace("/dashboard") via Next.js router
4. Dashboard layout → getSession() + onAuthStateChange listener
5. SIGNED_OUT event → redirect to /auth
6. Logout button → supabase.auth.signOut() → router.push('/')

## Known Fixes Applied
- proxy.js deleted — was intercepting /dashboard routes and blocking auth
- .vercelignore added — excludes v0 source folders from Vercel build
- next.config.mjs — typescript.ignoreBuildErrors: true for clean Vercel builds
- lib/supabase.js — persistSession: true, storageKey: sb-owdshunajxgyxiyzvsuf-auth-token

## Strict Coding Rules
- All new files must be .tsx (TypeScript)
- All secrets via .env.local only — never hardcode
- shadcn components in components/ui/ — NEVER modify directly
- lib/supabase.js is the ONLY Supabase client — never use createClient() in components
- Dashboard layout uses onAuthStateChange for session detection
- Auth card imports supabase from @/lib/supabase
- Every new component needs 'use client' if it uses hooks
- Colors must match scheme above exactly

## Feature Status
| Feature | Status |
|---------|--------|
| Landing page (animated) | ✅ DONE |
| Auth page (glassmorphism) | ✅ DONE |
| Dashboard layout + sidebar | ✅ DONE |
| Sidebar navigation | ✅ DONE |
| Health score gauge | ✅ DONE |
| Health trend chart | ✅ DONE |
| Severity donut chart | ✅ DONE |
| Source risk bar chart | ✅ DONE |
| Detection methodology card | ✅ DONE |
| AI Intelligence Summary | ✅ DONE |
| Live anomaly feed table | ✅ DONE |
| CSV export | ✅ DONE |
| Z-score color coding | ✅ DONE |
| Supabase RLS security | ✅ DONE |
| Vercel deployment | ✅ DONE |
| Anomalies page | 🔄 UI ONLY |
| Reports page | 🔄 UI ONLY |
| Settings page | 🔄 UI ONLY |

## Next Steps (if continuing)
1. Anomalies page — full filtered anomaly table with date range picker
2. Reports page — weekly summary cards from daily_health_scores
3. Settings page — alert threshold configuration form
4. Mobile responsiveness — sidebar collapse on small screens
5. Real-time Supabase subscription — replace setInterval with .on('postgres_changes')