"use client";

import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#0a0f1e] py-12">
      {/* Section divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo & tagline */}
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2E86DE]">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                RevenueRadar
              </span>
            </div>
            <div className="hidden h-4 w-px bg-white/10 md:block" />
            <p className="text-center text-sm text-white/50 md:text-left">
              Protecting your revenue, one transaction at a time.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-white/50">
            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              Privacy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              Terms
            </a>
            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} RevenueRadar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
