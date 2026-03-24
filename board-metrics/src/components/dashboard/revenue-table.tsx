"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, Search } from "lucide-react"

interface RevenueRecord {
  customerName: string
  month: string
  amount: number
}

interface RevenueTableProps {
  records: RevenueRecord[]
  totalRevenue: number
}

type SortKey = "customerName" | "month" | "amount"
type SortDir = "asc" | "desc"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[parseInt(m) - 1]} ${year}`
}

export function RevenueTable({ records, totalRevenue }: RevenueTableProps) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("amount")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const filtered = useMemo(() => {
    let data = records
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.month.includes(q)
      )
    }
    data = [...data].sort((a, b) => {
      let cmp = 0
      if (sortKey === "amount") cmp = a.amount - b.amount
      else cmp = a[sortKey].localeCompare(b[sortKey])
      return sortDir === "asc" ? cmp : -cmp
    })
    return data
  }, [records, search, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir(key === "amount" ? "desc" : "asc")
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Revenue by Customer
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {[
                { key: "customerName" as SortKey, label: "Customer" },
                { key: "month" as SortKey, label: "Month" },
                { key: "amount" as SortKey, label: "Revenue" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-5 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 select-none"
                  onClick={() => toggleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              ))}
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-zinc-400"
                >
                  {records.length === 0
                    ? "No data yet. Upload a QuickBooks export to get started."
                    : "No matching records found."}
                </td>
              </tr>
            ) : (
              filtered.map((record, i) => {
                const pct =
                  totalRevenue > 0
                    ? (record.amount / totalRevenue) * 100
                    : 0
                return (
                  <tr
                    key={`${record.customerName}-${record.month}-${i}`}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {record.customerName}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {formatMonth(record.month)}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 tabular-nums">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
          Showing {filtered.length} of {records.length} records
        </div>
      )}
    </div>
  )
}
