"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Upload } from "lucide-react"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RevenueTable } from "@/components/dashboard/revenue-table"

interface RevenueData {
  records: { customerName: string; month: string; amount: number }[]
  summary: {
    totalRevenue: number
    uniqueCustomers: number
    momGrowth: number | null
    topCustomer: { name: string; amount: number } | null
    monthRange: { from: string | null; to: string | null }
  }
  monthlyTotals: { month: string; total: number }[]
  customerTotals: { name: string; total: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/revenue")
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-zinc-400">Loading dashboard...</div>
      </div>
    )
  }

  const hasData = data && data.records.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          {hasData && data.summary.monthRange.from && (
            <p className="text-sm text-zinc-500 mt-1">
              {data.summary.monthRange.from} to {data.summary.monthRange.to}
            </p>
          )}
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Data
        </Link>
      </div>

      {!hasData ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-16 text-center">
          <Upload className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            No data yet
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            Upload a QuickBooks export to see your board metrics. We support CSV
            and Excel files with customer revenue data.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Your First File
          </Link>
        </div>
      ) : (
        <>
          <SummaryCards data={data.summary} />
          <RevenueChart
            monthlyTotals={data.monthlyTotals}
            customerTotals={data.customerTotals}
            records={data.records}
          />
          <RevenueTable
            records={data.records}
            totalRevenue={data.summary.totalRevenue}
          />
        </>
      )}
    </div>
  )
}
