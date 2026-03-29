"use client"

import { LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="flex h-full items-center justify-between px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time revenue analytics</p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-white">
              3
            </span>
          </Button>

          {/* User Info */}
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <span className="text-sm font-medium text-primary">JD</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">john.doe@company.com</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
