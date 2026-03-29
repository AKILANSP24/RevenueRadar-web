"use client"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Severity = "critical" | "warning" | "normal"

interface AnomalyData {
  id: string
  time: string
  source: string
  amount: string
  severity: Severity
  zScore: number
  explanation: string
}

const anomalyData: AnomalyData[] = [
  {
    id: "1",
    time: "2024-03-15 14:32:18",
    source: "Stripe Webhook",
    amount: "$12,450.00",
    severity: "critical",
    zScore: 4.2,
    explanation: "Unusual spike in transaction volume detected. 340% above normal baseline for this time period.",
  },
  {
    id: "2",
    time: "2024-03-15 13:45:02",
    source: "PayPal API",
    amount: "$3,280.00",
    severity: "warning",
    zScore: 2.8,
    explanation: "Transaction frequency increased by 180%. Potential promotional event detected.",
  },
  {
    id: "3",
    time: "2024-03-15 12:18:44",
    source: "Stripe Webhook",
    amount: "$890.00",
    severity: "normal",
    zScore: 1.1,
    explanation: "Minor variance within acceptable range. No action required.",
  },
  {
    id: "4",
    time: "2024-03-15 11:02:31",
    source: "Bank Transfer",
    amount: "$45,000.00",
    severity: "critical",
    zScore: 5.7,
    explanation: "Large single transaction flagged. Exceeds typical transaction threshold by 890%.",
  },
  {
    id: "5",
    time: "2024-03-15 10:28:15",
    source: "Apple Pay",
    amount: "$1,120.00",
    severity: "warning",
    zScore: 2.3,
    explanation: "New payment source detected with higher-than-average transaction value.",
  },
  {
    id: "6",
    time: "2024-03-15 09:15:08",
    source: "Stripe Webhook",
    amount: "$567.00",
    severity: "normal",
    zScore: 0.8,
    explanation: "Transaction within expected parameters. Pattern matches historical data.",
  },
  {
    id: "7",
    time: "2024-03-15 08:42:55",
    source: "Google Pay",
    amount: "$2,340.00",
    severity: "warning",
    zScore: 2.1,
    explanation: "Geographic anomaly detected. Transaction originated from unusual location.",
  },
]

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge
      className={cn(
        "font-medium capitalize",
        severity === "critical" && "bg-critical/20 text-critical border-critical/30 hover:bg-critical/30",
        severity === "warning" && "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30",
        severity === "normal" && "bg-success/20 text-success border-success/30 hover:bg-success/30"
      )}
    >
      {severity}
    </Badge>
  )
}

function ZScoreBadge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 4) return "text-critical"
    if (score >= 2) return "text-warning"
    return "text-success"
  }

  return (
    <span className={cn("font-mono font-semibold", getColor(score))}>
      {score.toFixed(1)}
    </span>
  )
}

export function AnomalyTable() {
  return (
    <div className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-[rgba(51,65,85,0.5)] shadow-xl rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Anomalies</h3>
        <p className="text-sm text-muted-foreground">Latest detected revenue anomalies with AI analysis</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Time</TableHead>
              <TableHead className="text-muted-foreground">Source</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">Severity</TableHead>
              <TableHead className="text-muted-foreground">Z-Score</TableHead>
              <TableHead className="text-muted-foreground">AI Explanation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anomalyData.map((row) => (
              <TableRow
                key={row.id}
                className="border-border/30 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono text-sm text-foreground/80">
                  {row.time}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {row.source}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {row.amount}
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={row.severity} />
                </TableCell>
                <TableCell>
                  <ZScoreBadge score={row.zScore} />
                </TableCell>
                <TableCell className="max-w-xs text-sm text-muted-foreground">
                  <p className="line-clamp-2">{row.explanation}</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
