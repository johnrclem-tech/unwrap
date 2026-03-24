"use client"

import { DollarSign, Users, TrendingUp, Crown } from "lucide-react"

interface SummaryData {
  totalRevenue: number
  uniqueCustomers: number
  momGrowth: number | null
  topCustomer: { name: string; amount: number } | null
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SummaryCards({ data }: { data: SummaryData | null }) {
  const cards = [
    {
      title: "Total Revenue",
      value: data ? formatCurrency(data.totalRevenue) : "--",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Customers",
      value: data ? String(data.uniqueCustomers) : "--",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "MoM Growth",
      value:
        data?.momGrowth != null
          ? `${data.momGrowth >= 0 ? "+" : ""}${data.momGrowth.toFixed(1)}%`
          : "--",
      icon: TrendingUp,
      color:
        data?.momGrowth != null && data.momGrowth >= 0
          ? "text-emerald-600"
          : "text-red-600",
      bg:
        data?.momGrowth != null && data.momGrowth >= 0
          ? "bg-emerald-50"
          : "bg-red-50",
    },
    {
      title: "Top Customer",
      value: data?.topCustomer
        ? data.topCustomer.name
        : "--",
      subtitle: data?.topCustomer
        ? formatCurrency(data.topCustomer.amount)
        : undefined,
      icon: Crown,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {card.title}
            </p>
            <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
            {card.value}
          </p>
          {card.subtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {card.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
