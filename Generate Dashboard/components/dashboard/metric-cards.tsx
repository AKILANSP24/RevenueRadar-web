"use client"

import { cn } from "@/lib/utils"
import { Activity, Zap, AlertTriangle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  variant?: "default" | "health"
  healthScore?: number
}

function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  variant = "default",
  healthScore,
}: MetricCardProps) {
  const isHealthy = healthScore !== undefined && healthScore >= 75

  return (
    <div className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-[rgba(51,65,85,0.5)] shadow-xl rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              "text-3xl font-bold",
              variant === "health"
                ? isHealthy
                  ? "text-success"
                  : "text-critical"
                : "text-foreground"
            )}
          >
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1">
              {changeType === "positive" && (
                <TrendingUp className="h-4 w-4 text-success" />
              )}
              {changeType === "negative" && (
                <TrendingDown className="h-4 w-4 text-critical" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  changeType === "positive" && "text-success",
                  changeType === "negative" && "text-critical",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            variant === "health"
              ? isHealthy
                ? "bg-success/20 text-success"
                : "bg-critical/20 text-critical"
              : "bg-primary/20 text-primary"
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

export function MetricCards() {
  const healthScore = 87

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Health Score"
        value={`${healthScore}%`}
        change="+2.5% from last week"
        changeType="positive"
        icon={<Activity className="h-6 w-6" />}
        variant="health"
        healthScore={healthScore}
      />
      <MetricCard
        title="Total Events"
        value="124,853"
        change="+12.3% from last week"
        changeType="positive"
        icon={<Zap className="h-6 w-6" />}
      />
      <MetricCard
        title="Anomalies"
        value="47"
        change="-8.2% from last week"
        changeType="positive"
        icon={<AlertTriangle className="h-6 w-6" />}
      />
      <MetricCard
        title="Critical Count"
        value="5"
        change="+2 from last week"
        changeType="negative"
        icon={<AlertCircle className="h-6 w-6" />}
      />
    </div>
  )
}
