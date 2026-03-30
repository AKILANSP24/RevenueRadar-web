# ⚡ RevenueRadar

> **Real-Time Revenue Anomaly Detection SaaS Platform powered by AI**

![RevenueRadar Banner](https://via.placeholder.com/1200x400/0a0f1e/2E86DE?text=RevenueRadar+%E2%80%94+Real-Time+Revenue+Intelligence)

[![Live Demo](https://img.shields.io/badge/Live_Demo-revenue--radar--web.vercel.app-black?style=for-the-badge&logo=vercel)](https://revenue-radar-web.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

---

## 🎓 Academic Context

| Field | Details |
|-------|---------|
| **Student** | SP Akilan |
| **Register No.** | 22MIA1191 |
| **Programme** | M.Tech CSE — Business Analytics |
| **Institution** | Vellore Institute of Technology, Chennai |
| **Module** | Cloud Ecosystem (Semester Project) |
| **Submission** | Real-Time Revenue Anomaly Detection SaaS |

---

## 🧠 What Is RevenueRadar?

RevenueRadar is a cloud-native SaaS platform that monitors multi-source revenue streams in real time and uses AI to detect, explain, and visualize anomalous transactions before they cause financial damage.

The system implements a **novel context-aware temporal baseline matrix** — a 24×7 grid (24 hours × 7 days) that understands what "normal" looks like at every specific hour of every day. Unlike simple threshold-based alerts, this approach flags the same transaction value differently depending on whether it occurs on a Monday morning or a Sunday night.

**Core novelty:** The temporal Z-score engine combined with Groq Llama-3 AI that generates human-readable explanations for every flagged anomaly.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REVENUERADAR ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────┘

  Simulators (Stripe / PayPal / Shopify)
         │
         ▼
  raw_events table (Supabase)
         │
         ▼
  Python Pipeline
  ├── schema.py       — Event validation
  ├── anomaly_engine.py — Temporal Z-score (24×7 baseline matrix)
  ├── ai_explainer.py — Groq Llama-3 AI explanations
  ├── database.py     — Supabase sync
  └── storage.py      — Parquet local storage
         │
         ▼
  anomaly_events + daily_health_scores (Supabase)
         │
         ▼
  Next.js 16 Dashboard (Vercel)
  ├── Real-time charts (Recharts)
  ├── AI Intelligence Summary
  ├── Source Risk Profiling
  └── CSV Export
```

---

## ✨ Features

### 🔍 Detection Engine
- **Temporal Baseline Z-Score** — 168-cell matrix (24h × 7days) using Welford's online algorithm
- **Multi-Source Correlation** — Stripe, PayPal, Shopify unified into single pipeline
- **Severity Classification** — Critical / Warning / Normal with configurable thresholds
- **Cold Start Handling** — Returns normal if fewer than 5 data points exist

### 🤖 AI Integration
- **Groq Llama-3 Explanations** — Every critical anomaly gets a 2-sentence plain English explanation
- **AI Intelligence Summary Panel** — Top 5 recent AI-explained anomalies displayed on dashboard
- **Graceful Fallback** — Handles API errors without breaking the pipeline

### 📊 Dashboard
- **Health Score Gauge** — Radial chart showing system revenue health (0-100)
- **Trend Chart** — 14-day health score area chart
- **Severity Donut** — Distribution of anomaly types
- **Source Risk Bar Chart** — Which payment source generates most anomalies
- **Live Anomaly Feed** — Real-time table with Z-scores, AI explanations, severity badges
- **CSV Export** — One-click compliance-ready export
- **Detection Methodology Card** — Explains the analytical approach

### 🔒 Security
- **Supabase Auth** — Email/password with session persistence
- **Row Level Security (RLS)** — Authenticated users read-only, service role insert-only
- **Environment Variables** — All secrets via `.env.local`, never committed

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| UI Components | shadcn/ui, lucide-react |
| Charts | Recharts |
| Backend | Python 3, Supabase Python SDK |
| AI | Groq API (llama3-8b-8192) |
| Database | Supabase (PostgreSQL) |
| Storage | Apache Parquet (pyarrow) |
| Deployment | Vercel (frontend), Local (pipeline) |
| Auth | Supabase Auth |

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- Python 3.10+
- Supabase account

### Frontend

```bash
git clone https://github.com/AKILANSP24/RevenueRadar-web.git
cd RevenueRadar-web
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

### Backend Pipeline

```bash
git clone https://github.com/AKILANSP24/revenueradar.git
cd revenueradar
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r pipeline/requirements.txt
```

Create `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_key
SIM_EVENTS_PER_MINUTE=20
SIM_ANOMALY_INJECTION_RATE=0.05
```

Run pipeline:
```bash
# Terminal 1 — Start simulators
python simulator/orchestrator.py

# Terminal 2 — Start pipeline
python pipeline/main.py
```

---

## 🗄️ Database Schema

### `raw_events`
Stores all incoming simulator events. Realtime enabled.

### `anomaly_events`
Warning and critical events with Z-score, severity, and AI explanation.

### `daily_health_scores`
Per-date aggregates: health score, total events, anomaly count, critical count.

**Health Score Formula:**
```
score = 100 - ((critical × 10) + (warning × 3) + (avg_zscore × 2))
```
Clamped between 0 and 100.

---

## 🔒 Supabase RLS Setup

Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE anomaly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access" ON anomaly_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON daily_health_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON raw_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service_role insert" ON anomaly_events FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service_role insert" ON daily_health_scores FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service_role insert" ON raw_events FOR INSERT TO service_role WITH CHECK (true);
```

---

## 📸 Screenshots

> Add screenshots here after taking them from the live dashboard.

---

## 📄 License

Academic project — VIT Chennai, 2026.
