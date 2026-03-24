"use client"

import { useEffect, useState } from "react"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RevenueTable } from "@/components/dashboard/revenue-table"

interface RevenueData {
  records: { customerName: string; month: string; amount: number }[]
  summary: {
    totalRevenue: number
    uniqueCustomers: number
    momGrowth: number | null
    topCustomer: { name: string; amount: number } | null
  }
  monthlyTotals: { month: string; total: number }[]
  customerTotals: { name: string; total: number }[]
}

export default function RevenuePage() {
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
        <div className="text-sm text-zinc-400">Loading revenue data...</div>
      </div>
    )
  }

  if (!data || data.records.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400">
        No revenue data available. Upload a QuickBooks export first.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Revenue Metrics
      </h1>
      <RevenueChart
        monthlyTotals={data.monthlyTotals}
        customerTotals={data.customerTotals}
        records={data.records}
      />
      <RevenueTable
        records={data.records}
        totalRevenue={data.summary.totalRevenue}
      />
    </div>
  )
}
