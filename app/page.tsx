import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#0a0f1e' }}>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-bold text-white">RevenueRadar</span>
        </div>
        <Link href="/auth">
          <button
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ background: '#2E86DE' }}
          >
            Login
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-8 py-32">
        <div
          className="mb-4 px-3 py-1 rounded-full text-sm font-medium"
          style={{ background: '#1e3a5f', color: '#2E86DE' }}
        >
          Real-Time Revenue Intelligence
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 max-w-3xl leading-tight">
          Catch Revenue Anomalies
          <span style={{ color: '#2E86DE' }}> Before They Cost You</span>
        </h1>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl">
          RevenueRadar monitors every transaction in real time and tells you
          exactly when something is wrong — before you notice it yourself.
        </p>
        <div className="flex gap-4">
          <Link href="/auth">
            <button
              className="px-8 py-4 rounded-lg text-white font-semibold text-lg"
              style={{ background: '#2E86DE' }}
            >
              Get Started Free
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="px-8 py-4 rounded-lg text-white font-semibold text-lg border border-gray-600">
              View Demo
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Why RevenueRadar?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🧠',
              title: 'Context-Aware Detection',
              desc: 'Our temporal baseline understands what normal looks like at every hour of every day — not just a dumb threshold.',
            },
            {
              icon: '⚡',
              title: 'Real-Time Alerts',
              desc: 'Every transaction is scored instantly. Critical anomalies are flagged in seconds with AI-generated explanations.',
            },
            {
              icon: '📊',
              title: 'Multi-Source Analytics',
              desc: 'Unify Stripe, Shopify, and PayPal data into a single intelligence dashboard with zero configuration.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-800"
              style={{ background: '#111827' }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-8 py-20" style={{ background: '#070b14' }}>
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {[
            {
              step: '01',
              title: 'Connect Sources',
              desc: 'Your revenue streams flow in via simulator or real webhooks',
            },
            {
              step: '02',
              title: 'AI Scores Every Event',
              desc: 'Temporal baseline engine classifies each transaction instantly',
            },
            {
              step: '03',
              title: 'You Get Intelligence',
              desc: 'Live dashboard shows anomalies, health score, and AI explanations',
            },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center p-6">
              <div className="text-5xl font-bold mb-4" style={{ color: '#2E86DE' }}>
                {s.step}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 border-t border-gray-800">
        <p>⚡ RevenueRadar — Built on GCP + Supabase + Next.js</p>
      </footer>

    </main>
  )
}