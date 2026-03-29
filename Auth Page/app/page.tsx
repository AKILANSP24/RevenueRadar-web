import { AnimatedBackground } from "@/components/auth/animated-background"
import { AuthCard } from "@/components/auth/auth-card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#0a0f1e" }}
    >
      {/* Animated background layers */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-10 w-full flex flex-col items-center gap-8">
        {/* Auth card */}
        <AuthCard />

        {/* Back to home */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-400/45 hover:text-slate-400/80 transition-colors duration-150 group"
        >
          <ArrowLeft
            className="w-3 h-3 transition-transform duration-150 group-hover:-translate-x-0.5"
          />
          Back to home
        </Link>
      </div>

      {/* Fine print */}
      <footer className="relative z-10 mt-10 text-center text-xs text-slate-400/30">
        &copy; {new Date().getFullYear()} RevenueRadar Inc. &nbsp;&middot;&nbsp;{" "}
        <Link
          href="#"
          className="text-slate-400/45 hover:text-slate-400/70 transition-colors duration-150 hover:underline"
        >
          Privacy
        </Link>
        &nbsp;&middot;&nbsp;
        <Link
          href="#"
          className="text-slate-400/45 hover:text-slate-400/70 transition-colors duration-150 hover:underline"
        >
          Terms
        </Link>
      </footer>
    </main>
  )
}
