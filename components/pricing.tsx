"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  "Up to 10,000 transactions/month",
  "Real-time anomaly detection",
  "Email & Slack alerts",
  "Basic analytics dashboard",
  "API access",
  "Community support",
];

export function Pricing() {
  return (
    <section className="relative bg-[#0a0f1e] py-24">
      {/* Section divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start for free
          </h2>
          <p className="mt-4 text-lg text-white/60">
            No credit card required. Upgrade when you need more.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-md">
          {/* Pricing card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
            {/* Gradient glow */}
            <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#2E86DE]/20 blur-3xl" />

            <div className="relative">
              {/* Badge */}
              <div className="mb-4 inline-flex rounded-full border border-[#2E86DE]/30 bg-[#2E86DE]/10 px-3 py-1 text-sm text-[#2E86DE]">
                Free Forever
              </div>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-white/50">/month</span>
              </div>

              {/* Description */}
              <p className="mb-8 text-white/60">
                Perfect for startups and small businesses getting started with
                revenue monitoring.
              </p>

              {/* Features */}
              <ul className="mb-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10">
                      <Check className="h-3 w-3 text-[#10B981]" />
                    </div>
                    <span className="text-sm text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button asChild className="group w-full gap-2 bg-[#2E86DE] text-white hover:bg-[#2573c4]">
                <Link href="/auth">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
