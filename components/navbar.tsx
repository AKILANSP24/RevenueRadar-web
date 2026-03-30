"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2E86DE]">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            RevenueRadar
          </span>
        </div>
        <Link href="/auth">
          <Button
            variant="outline"
            className="border-[#10B981]/30 bg-[#10B981]/5 text-white hover:bg-[#10B981]/10 hover:text-white hover:border-[#10B981]/50"
          >
            Login
          </Button>
        </Link>
      </div>
    </nav>
  );
}
