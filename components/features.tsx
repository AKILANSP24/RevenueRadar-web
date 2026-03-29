"use client";
import { Zap, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Detection",
    description: "Our AI monitors your revenue streams 24/7 and alerts you within seconds when anomalies occur.",
    color: "#2E86DE",
    bg: "#2E86DE"
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    description: "Automatically detect suspicious patterns and prevent revenue leakage before it impacts your bottom line.",
    color: "#10B981",
    bg: "#10B981"
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Get actionable insights with AI-powered reports that help you understand trends and make data-driven decisions.",
    color: "#2E86DE",
    bg: "#2E86DE"
  },
];

export function Features() {
  return (
    <section className="relative bg-[#0a0f1e] py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to protect your revenue
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Powerful features designed to keep your business safe and growing.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]"
              style={{ ['--hover-color' as string]: feature.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${feature.bg}15`, color: feature.color }}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}