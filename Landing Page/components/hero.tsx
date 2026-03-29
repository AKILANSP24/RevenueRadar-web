"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0f1e] pt-32 pb-20">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#2E86DE]/30 blur-[120px]" />
        <div className="animate-blob animation-delay-2000 absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-[#2E86DE]/20 blur-[100px]" />
        <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#2E86DE]/25 blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E86DE] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2E86DE]" />
            </span>
            Real-time anomaly detection
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Catch Revenue Anomalies
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#2E86DE] via-[#54a0ff] to-[#2E86DE] bg-clip-text text-transparent">
              Before They Cost You
            </span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/60 sm:text-xl">
            Monitor your revenue streams in real-time. Get instant alerts when
            something goes wrong. Powered by AI to detect patterns humans miss.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group h-12 gap-2 bg-[#2E86DE] px-6 text-base font-medium text-white hover:bg-[#2573c4]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 gap-2 border-white/20 bg-transparent px-6 text-base font-medium text-white hover:bg-white/5 hover:text-white"
            >
              <Play className="h-4 w-4" />
              View Demo
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2 shadow-2xl shadow-[#2E86DE]/10 backdrop-blur-sm">
            <div className="overflow-hidden rounded-lg border border-white/5 bg-[#0a0f1e]">
              {/* Mock Dashboard */}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    All systems operational
                  </div>
                </div>
                {/* Chart area */}
                <div className="relative h-48 w-full">
                  <svg className="h-full w-full" viewBox="0 0 800 200">
                    {/* Grid lines */}
                    {[0, 50, 100, 150, 200].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="800"
                        y2={y}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="4 4"
                      />
                    ))}
                    {/* Revenue line */}
                    <path
                      d="M0,150 C50,140 100,145 150,130 S250,100 300,110 S400,80 450,90 S550,50 600,60 S700,40 750,45 L800,50"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Anomaly point */}
                    <circle cx="450" cy="90" r="8" fill="#2E86DE" />
                    <circle
                      cx="450"
                      cy="90"
                      r="16"
                      fill="none"
                      stroke="#2E86DE"
                      strokeWidth="2"
                      opacity="0.3"
                    >
                      <animate
                        attributeName="r"
                        values="8;20;8"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.5;0;0.5"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Area fill */}
                    <path
                      d="M0,150 C50,140 100,145 150,130 S250,100 300,110 S400,80 450,90 S550,50 600,60 S700,40 750,45 L800,50 L800,200 L0,200 Z"
                      fill="url(#areaGradient)"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2E86DE" />
                        <stop offset="100%" stopColor="#54a0ff" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2E86DE" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2E86DE" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Anomaly Label */}
                  <div className="absolute right-[calc(50%-60px)] top-[30%] rounded-lg border border-[#2E86DE]/30 bg-[#2E86DE]/10 px-3 py-1.5 text-xs text-[#54a0ff] backdrop-blur-sm">
                    Anomaly Detected
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-[#2E86DE]/20 via-transparent to-[#2E86DE]/20 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
