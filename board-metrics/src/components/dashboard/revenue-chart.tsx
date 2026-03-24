"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { useState } from "react"

interface MonthlyTotal {
  month: string
  total: number
}

interface CustomerTotal {
  name: string
  total: number
}

interface RevenueChartProps {
  monthlyTotals: MonthlyTotal[]
  customerTotals: CustomerTotal[]
  records: { customerName: string; month: string; amount: number }[]
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[parseInt(m) - 1]} ${year}`
}

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
]

export function RevenueChart({
  monthlyTotals,
  customerTotals,
  records,
}: RevenueChartProps) {
  const [view, setView] = useState<"trend" | "byCustomer">("trend")

  // Build stacked data: one entry per month, with a key per customer
  const topCustomers = customerTotals.slice(0, 8).map((c) => c.name)
  const months = [...new Set(records.map((r) => r.month))].sort()

  const stackedData = months.map((month) => {
    const entry: Record<string, string | number> = { month: formatMonth(month) }
    let otherTotal = 0

    for (const record of records.filter((r) => r.month === month)) {
      if (topCustomers.includes(record.customerName)) {
        entry[record.customerName] =
          ((entry[record.customerName] as number) || 0) + record.amount
      } else {
        otherTotal += record.amount
      }
    }

    if (otherTotal > 0) entry["Other"] = otherTotal
    return entry
  })

  const allKeys = topCustomers.slice()
  if (stackedData.some((d) => (d["Other"] as number) > 0)) {
    allKeys.push("Other")
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Monthly Revenue
        </h3>
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setView("trend")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              view === "trend"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Trend
          </button>
          <button
            onClick={() => setView("byCustomer")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              view === "byCustomer"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            By Customer
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {view === "trend" ? (
            <LineChart
              data={monthlyTotals.map((d) => ({
                ...d,
                month: formatMonth(d.month),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={stackedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              {allKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="revenue"
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
