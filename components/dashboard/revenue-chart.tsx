"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

const data = [
  { name: "Mon", health: 82, revenue: 45000 },
  { name: "Tue", health: 78, revenue: 52000 },
  { name: "Wed", health: 85, revenue: 48000 },
  { name: "Thu", health: 72, revenue: 61000 },
  { name: "Fri", health: 89, revenue: 55000 },
  { name: "Sat", health: 91, revenue: 67000 },
  { name: "Sun", health: 87, revenue: 43000 },
]

export function RevenueChart() {
  return (
    <div className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-[rgba(51,65,85,0.5)] shadow-xl rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Revenue Health Trend</h3>
        <p className="text-sm text-muted-foreground">Weekly revenue health score overview</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[60, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(51, 65, 85, 0.5)",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
              labelStyle={{ color: "#94a3b8" }}
              formatter={(value: number) => [`${value}%`, "Health Score"]}
            />
            <Area
              type="monotone"
              dataKey="health"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#healthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
