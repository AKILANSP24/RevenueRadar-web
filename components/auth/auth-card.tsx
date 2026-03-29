"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LightningBoltIcon } from "./lightning-bolt"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

type Tab = "login" | "signup"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function AuthCard() {
  const [tab, setTab] = useState<Tab>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (tab === "signup" && password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    if (tab === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        window.location.href = "/dashboard"
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setError("")
        alert("Account created! Check your email to confirm, then sign in.")
        setTab("login")
        setLoading(false)
      }
    }
  }

  return (
    <div className="glass-card rounded-2xl w-full max-w-md mx-auto p-8 flex flex-col gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-1">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{
            background: "rgba(37,99,235,0.15)",
            border: "1px solid rgba(79,136,255,0.3)",
            boxShadow: "0 0 24px rgba(37,99,235,0.25)",
          }}
        >
          <LightningBoltIcon className="w-7 h-7 animate-bolt" />
        </div>
        <div className="text-center">
          <h1
            className="text-2xl font-bold tracking-tight text-balance"
            style={{ color: "#f0f6ff" }}
          >
            RevenueRadar
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.7)" }}>
            Revenue intelligence, reimagined
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div
        className="relative flex rounded-xl p-1 gap-1"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
        role="tablist"
        aria-label="Authentication mode"
      >
        {(["login", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => { setTab(t); setError("") }}
            className="relative flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 cursor-pointer"
            style={{
              color: tab === t ? "#f0f6ff" : "rgba(148,163,184,0.6)",
              background: tab === t ? "rgba(37,99,235,0.22)" : "transparent",
              border: tab === t ? "1px solid rgba(79,136,255,0.3)" : "1px solid transparent",
              boxShadow: tab === t
                ? "0 0 14px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "none",
            }}
          >
            {t === "login" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="rounded-lg px-4 py-2.5 text-sm"
          style={{
            background: "rgba(220,38,38,0.12)",
            border: "1px solid rgba(220,38,38,0.3)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label={tab === "login" ? "Sign in form" : "Sign up form"}>
        {/* Name field — signup only */}
        {tab === "signup" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.85)" }}>
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="input-glow h-10 text-sm rounded-lg transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f0f6ff",
              }}
            />
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.85)" }}>
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input-glow h-10 text-sm rounded-lg transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f0f6ff",
            }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.85)" }}>
              Password
            </Label>
            {tab === "login" && (
              <Link
                href="#"
                className="text-xs text-blue-400/80 hover:text-blue-300 transition-colors duration-150"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              className="input-glow h-10 text-sm rounded-lg pr-10 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f0f6ff",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
              style={{ color: "rgba(148,163,184,0.5)" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password — signup only */}
        {tab === "signup" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm" className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.85)" }}>
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="input-glow h-10 text-sm rounded-lg pr-10 transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f0f6ff",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                style={{ color: "rgba(148,163,184,0.5)" }}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="h-10 w-full mt-1 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer"
          style={{
            background: loading
              ? "rgba(37,99,235,0.5)"
              : "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
            border: "none",
            color: "#fff",
            boxShadow: loading
              ? "none"
              : "0 4px 20px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {tab === "login" ? "Signing in…" : "Creating account…"}
            </span>
          ) : tab === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* SSO hint */}
      <button
        type="button"
        className="h-10 w-full rounded-lg text-sm font-medium transition-all duration-200 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.09] text-slate-400/80 hover:text-[#f0f6ff] cursor-pointer"
      >
        Continue with SSO
      </button>

      {/* Footer toggle */}
      <p className="text-center text-xs text-slate-400/55">
        {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError("") }}
          className="font-medium text-blue-400/90 hover:text-blue-300 transition-colors duration-150 cursor-pointer"
        >
          {tab === "login" ? "Sign up free" : "Sign in"}
        </button>
      </p>
    </div>
  )
}