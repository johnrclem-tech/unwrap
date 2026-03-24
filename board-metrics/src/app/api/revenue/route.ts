import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromMonth = searchParams.get("from")
    const toMonth = searchParams.get("to")

    const where: Record<string, unknown> = {}
    if (fromMonth || toMonth) {
      where.month = {}
      if (fromMonth) (where.month as Record<string, string>).gte = fromMonth
      if (toMonth) (where.month as Record<string, string>).lte = toMonth
    }

    // Get all revenue records with customer info
    const records = await prisma.revenueRecord.findMany({
      where,
      include: {
        customer: true,
        upload: {
          select: { filename: true, uploadedAt: true },
        },
      },
      orderBy: [{ month: "asc" }, { customer: { name: "asc" } }],
    })

    // Aggregate by customer and month (taking latest upload per customer-month)
    const aggregated = new Map<
      string,
      {
        customerName: string
        month: string
        amount: number
        uploadedAt: Date
      }
    >()

    for (const record of records) {
      const key = `${record.customer.name}|${record.month}`
      const existing = aggregated.get(key)
      if (!existing || record.upload.uploadedAt > existing.uploadedAt) {
        aggregated.set(key, {
          customerName: record.customer.name,
          month: record.month,
          amount: Number(record.amount),
          uploadedAt: record.upload.uploadedAt,
        })
      }
    }

    const data = Array.from(aggregated.values()).map(
      ({ customerName, month, amount }) => ({
        customerName,
        month,
        amount,
      })
    )

    // Calculate summary stats
    const totalRevenue = data.reduce((sum, r) => sum + r.amount, 0)
    const uniqueCustomers = new Set(data.map((r) => r.customerName)).size
    const months = [...new Set(data.map((r) => r.month))].sort()

    // Monthly totals for chart
    const monthlyTotals = new Map<string, number>()
    for (const record of data) {
      monthlyTotals.set(
        record.month,
        (monthlyTotals.get(record.month) || 0) + record.amount
      )
    }

    // Revenue by customer (totals)
    const customerTotals = new Map<string, number>()
    for (const record of data) {
      customerTotals.set(
        record.customerName,
        (customerTotals.get(record.customerName) || 0) + record.amount
      )
    }

    // Month-over-month growth
    const sortedMonthlyTotals = [...monthlyTotals.entries()].sort(
      ([a], [b]) => a.localeCompare(b)
    )
    let momGrowth: number | null = null
    if (sortedMonthlyTotals.length >= 2) {
      const current =
        sortedMonthlyTotals[sortedMonthlyTotals.length - 1][1]
      const previous =
        sortedMonthlyTotals[sortedMonthlyTotals.length - 2][1]
      momGrowth = previous > 0 ? ((current - previous) / previous) * 100 : null
    }

    // Top customer
    const topCustomer = [...customerTotals.entries()].sort(
      ([, a], [, b]) => b - a
    )[0]

    return NextResponse.json({
      records: data,
      summary: {
        totalRevenue,
        uniqueCustomers,
        monthRange: { from: months[0] || null, to: months[months.length - 1] || null },
        momGrowth,
        topCustomer: topCustomer
          ? { name: topCustomer[0], amount: topCustomer[1] }
          : null,
      },
      monthlyTotals: sortedMonthlyTotals.map(([month, total]) => ({
        month,
        total,
      })),
      customerTotals: [...customerTotals.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([name, total]) => ({ name, total })),
    })
  } catch (error) {
    console.error("Revenue API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    )
  }
}
