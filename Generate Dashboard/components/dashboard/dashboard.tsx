"use client"

import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { MetricCards } from "./metric-cards"
import { RevenueChart } from "./revenue-chart"
import { AnomalyDonut } from "./anomaly-donut"
import { AnomalyTable } from "./anomaly-table"

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="pl-64 transition-all duration-300">
        {/* Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="min-h-screen pt-16">
          <div className="p-6 space-y-6">
            {/* Row 1: Metric Cards */}
            <MetricCards />

            {/* Row 2: Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <RevenueChart />
              <AnomalyDonut />
            </div>

            {/* Row 3: Data Table */}
            <AnomalyTable />
          </div>
        </main>
      </div>
    </div>
  )
}
